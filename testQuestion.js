// models/testQuestion.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TestQuestionSchema = new Schema({
  text: { type: String, required: true },
  answers: [
    {
      text: { type: String, required: true },
      isCorrect: { type: Boolean, default: false }
    }
  ],
  points: { type: Number, default: 1 },
  testId: { type: Schema.Types.ObjectId, ref: 'Test', required: true }
}, { timestamps: true }); // Додати timestamps для зручності

module.exports = mongoose.model('TestQuestion', TestQuestionSchema);
