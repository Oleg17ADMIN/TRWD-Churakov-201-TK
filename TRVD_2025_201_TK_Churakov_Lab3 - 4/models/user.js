const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: Number,
  isAdmin: { type: Boolean, default: false } // За замовчуванням false
});

// Перед збереженням хешуємо пароль
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Метод для перевірки пароля
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Щоб уникнути OverwriteModelError:
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
