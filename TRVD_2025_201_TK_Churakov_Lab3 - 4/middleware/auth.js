// middleware/auth.js

module.exports = function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  
  req.flash('error_msg', 'Будь ласка, увійдіть, щоб переглянути цю сторінку');
  res.redirect('/login');
};