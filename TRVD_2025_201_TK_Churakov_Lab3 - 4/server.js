const express = require('express');
const mustacheExpress = require('mustache-express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');
const morgan = require('morgan'); // Додано для логування
const bcrypt = require('bcrypt'); // Додано для хешування пароля
const methodOverride = require('method-override');
const User = require('./models/user'); // або ваш шлях до моделі
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

console.log(`Середовище: ${process.env.NODE_ENV || 'development'}`);

// Підключення до MongoDB
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mydatabase')
  .then(() => console.log('MongoDB підключено'))
  .catch(err => console.error('Помилка підключення до MongoDB', err));

// Налаштування шаблонізатора
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(morgan('dev'));

// Сесія
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'секрет',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 години
    }
  })
);

// Passport та Flash
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Імпорт моделі User
const apiUserRoutes = require('./routes/apiUserRoutes');
app.use('/api/users', apiUserRoutes);
// Переконайтеся, що шлях вірний

// Налаштування Passport
passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      console.log(`Спроба входу для: ${email}`);
      const user = await User.findOne({ email });  // Виправлено: User з великої літери

      if (!user) {
        console.log('Користувача не знайдено');
        return done(null, false, { message: 'Невірний email або пароль' });
      }

      // Перевірка пароля
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        console.log('Невірний пароль');
        return done(null, false, { message: 'Невірний email або пароль' });
      }

      console.log('Успішна аутентифікація');
      return done(null, user);
    } catch (err) {
      console.error('Помилка при аутентифікації:', err);
      return done(err);
    }
  })
);

// Серіалізація/десеріалізація
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Middleware для передачі змінних до шаблонів
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Підключення роутерів
const indexRouter = require('./routes/index');
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const testRouter = require('./routes/testRoutes');
const resultRouter = require('./routes/result');

app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/users', userRouter);
app.use('/tests', testRouter);
app.use('/', resultRouter);

// API роути
const testApiRouter = require('./routes/api/testApi');
app.use('/api/tests', testApiRouter);

const cors = require('cors');
app.use(cors());

// Обробка POST /login
app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('Помилка аутентифікації:', err);
      req.flash('error_msg', 'Помилка сервера');
      return res.redirect('/login');
    }
    
    if (!user) {
      console.log('Аутентифікація не вдалася:', info?.message || 'Невідома помилка');
      req.flash('error_msg', info?.message || 'Невірний email або пароль');
      return res.redirect('/login');
    }
    
    req.logIn(user, (err) => {
      if (err) {
        console.error('Помилка входу:', err);
        req.flash('error_msg', 'Помилка входу');
        return res.redirect('/login');
      }
      
      console.log('Користувач успішно увійшов:', user.email);
      
      // Перенаправлення в залежності від ролі
      if (user.role === 'admin') {
        return res.redirect('/admin/dashboard');
      }
      return res.redirect('/tests');
    });
  })(req, res, next);
});

// Обробка 404
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  res.status(404).render('error', { 
    title: '404 Not Found',
    message: 'Сторінку не знайдено' 
  });
});

// Обробка помилок
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ERROR: ${err.message}`);
  
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : ''
    });
  }

  res.status(500).render('error', {
    title: '500 Server Error',
    message: 'Внутрішня помилка сервера'
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущено на http://localhost:${PORT}`);
});