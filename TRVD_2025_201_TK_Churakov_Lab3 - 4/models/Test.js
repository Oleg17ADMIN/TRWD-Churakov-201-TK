const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const testSchema = new Schema({
  title: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  questions: [{ type: Schema.Types.ObjectId, ref: 'TestQuestion' }],
  timeLimit: { 
    type: Number, 
    default: 0,
    min: 0
  }
}, { timestamps: true }); // Додаємо часові мітки

const Test = mongoose.model('Test', testSchema);
module.exports = Test;
