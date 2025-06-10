const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TestResultSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  testId: { type: Schema.Types.ObjectId, ref: 'Test', required: true },
  score: { type: Number, required: true },
  duration: { type: Number, required: false }, // тривалість проходження у секундах
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TestResult', TestResultSchema);