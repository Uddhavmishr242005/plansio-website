const jwt = require('jsonwebtoken');

exports.generateToken = (id, role = 'customer') => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

exports.sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = exports.generateToken(user._id, user.role);
  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: {
      id:         user._id,
      name:       user.name,
      email:      user.email,
      phone:      user.phone,
      role:       user.role,
      isVerified: user.isVerified,
      avatar:     user.avatar
    }
  });
};
