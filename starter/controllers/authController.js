const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const AppErorr = require('./../utils/appError');
const User = require('./../models/userModel');
const catchAsynch = require('./../utils/catchAsynch');
const AppError = require('./../utils/appError');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
exports.signup = catchAsynch(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });
  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});
exports.login = catchAsynch(async (req, res, next) => {
  const { email, password } = req.body;

  //1- if email & pass exist
  if (!email || !password) {
    return next(new AppErorr('please provide email and password', 400));
  }
  //2- if user exist & pass is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('incorrect email or password', 401));
  }
  //3- if everything is ok, send token to client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsynch(async (req, res, next) => {
  let token;
  //1 getting the token and check of its there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppErorr('you are not logged in ! please log in to get access', 401)
    );
  }
  //2 verfication token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3 check if user still exist
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppErorr(
        'the user belonging to this token does no longer exist.',
        401
      )
    );
  }
  //4 check if user changed pass after token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppErorr('use recently changed password! please login again.', 401)
    );
  }
  // grant access to protected route
  req.user = currentUser;
  next();
});
