// controllers/resultController.js
const TestResult = require('../models/TestResult');

exports.myResults = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    const results = await TestResult.find({ userId }).populate('testId').lean().exec();
    res.render('myResults', { results, title: 'Мої результати', user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Помилка отримання результатів');
  }
};
