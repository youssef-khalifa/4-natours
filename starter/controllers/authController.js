const User = require('./../models/userModel');
const AppError = require('../utils/appError');
const catchAsynch = require('./../utils/catchAsynch');

exports.signup = catchAsynch(async (req, res, next) => {
  const newUser = await User.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});
