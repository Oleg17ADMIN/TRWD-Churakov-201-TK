const Test = require('../models/Test');
const Result = require('../models/Result');
const Question = require('../models/testQuestion');

// Список тестів
exports.getTests = async (req, res) => {
  try {
    const tests = await Test.find();
    res.render('tests', {
      title: 'Список тестів',
      tests,
      user: req.user || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Помилка сервера' });
  }
};

// Форма створення нового тесту
exports.newTestForm = (req, res) => {
  res.render('newTest', { title: 'Створення тесту', user: req.user || null });
};

// Створити новий тест
exports.createTest = async (req, res) => {
  try {
    const { title, description, timeLimit } = req.body;
    const newTest = new Test({
      title,
      description,
      timeLimit: parseInt(timeLimit, 10) || 0,
      questions: []
    });
    await newTest.save();
    res.redirect('/tests');
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Помилка створення тесту' });
  }
};

// Показати деталі тесту
exports.getTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate({
        path: 'questions',
        model: 'TestQuestion',
        select: 'text answers points'
      })
      .lean();

    if (!test) return res.status(404).render('error', { message: 'Тест не знайдено' });

    // Додати індекс для коректної роботи шаблону
    test.questions = test.questions.map((question, index) => {
      return {
        ...question,
        index: index
      };
    });

    const startTimestamp = Date.now();
    
    res.render('testDetail', {
      title: `Тест: ${test.title}`,
      test,
      startTimestamp,
      user: req.user || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Помилка завантаження тесту' });
  }
};

// Форма редагування тесту
exports.editTestForm = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).render('error', { message: 'Тест не знайдено' });
    }
    res.render('editTest', { title: 'Редагування тесту', test });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Помилка при редагуванні тесту' });
  }
};

// Оновити тест
exports.updateTest = async (req, res) => {
  try {
    const { title, description, timeLimit } = req.body;
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).render('error', { message: 'Тест не знайдено' });
    }
    test.title = title;
    test.description = description;
    test.timeLimit = parseInt(timeLimit, 10) || 0;
    await test.save();
    res.redirect('/tests');
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Помилка оновлення тесту' });
  }
};

// Здати тест
exports.submitTest = async (req, res) => {
  try {
    const testId = req.params.id;
    const userId = req.user ? req.user._id : null;
    const answers = req.body.answers || {};
    const test = await Test.findById(testId).populate('questions');
    
    if (!test) {
      return res.status(404).render('error', { message: 'Тест не знайдено' });
    }

    let score = 0;
    
    test.questions.forEach((question, index) => {
      const userAnswers = answers[index] || [];
      
      // Знаходимо всі правильні відповіді
      const correctAnswers = question.answers
        .filter(a => a.isCorrect)
        .map(a => a.text);
      
      // Перевіряємо чи всі правильні відповіді обрані
      const allCorrectSelected = correctAnswers.length > 0 && 
        correctAnswers.every(ca => userAnswers.includes(ca));
      
      // Перевіряємо чи не обрані неправильні відповіді
      const noIncorrectSelected = userAnswers.length > 0 && 
        userAnswers.every(ua => correctAnswers.includes(ua));
      
      // Нараховуємо бали, якщо умови виконані
      if (allCorrectSelected && noIncorrectSelected) {
        score += question.points || 1;
      }
    });

    // Обчислюємо час проходження тесту
    let timeTaken;
    if (req.body.startTimestamp) {
      const start = parseInt(req.body.startTimestamp, 10);
      const end = Date.now();
      timeTaken = Math.floor((end - start) / 1000);
    }

    // Зберігаємо результат
    const newResult = new Result({
      userId,
      testId,
      score,
      timeTaken,
      userAnswers: answers
    });
    
    await newResult.save();
    
    // Відображаємо результати
    res.render('testResult', {
      title: 'Результат тесту',
      test,
      score,
      timeTaken: timeTaken || null,
      user: req.user || null
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Помилка проходження тесту' });
  }
};

// Створити нове питання
exports.createQuestion = async (req, res) => {
  try {
    const testId = req.params.testId;
    const { text, points, answers } = req.body;
    let parsedAnswers;
    if (typeof answers === 'string') {
      parsedAnswers = JSON.parse(answers);
    } else {
      parsedAnswers = answers;
    }
    const newQuestion = new Question({
      text,
      points: parseInt(points, 10) || 0,
      answers: parsedAnswers,
      testId
    });
    await newQuestion.save();
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).render('error', { message: 'Тест не знайдено' });
    }
    test.questions.push(newQuestion._id);
    await test.save();
    res.redirect(`/tests/${testId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Помилка сервера');
  }
};

// Видалити тест 
exports.deleteTest = async (req, res) => {
  try {
    const testId = req.params.id;
    const test = await Test.findById(testId);
    if (!test) return res.status(404).render('error', { message: 'Тест не знайдено' });

    // Видаляємо всі пов'язані запитання
    await Question.deleteMany({ testId: test._id });

    // Видаляємо тест
    await Test.findByIdAndDelete(testId);

    res.redirect('/tests');
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Помилка видалення тесту' });
  }
};