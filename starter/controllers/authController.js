const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const AppErorr = require('./../utils/appError');
const User = require('./../models/userModel');
const catchAsynch = require('./../utils/catchAsynch');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

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
    role: req.body.role,
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

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles is [admin,lead-guide]
    if (!roles.includes(req.user.role)) {
      return next(
        new AppErorr(
          'you do not have the permission to perform this action',
          403
        )
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsynch(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});
exports.resetPassword = catchAsynch(async (req, res, next) => {
  //1 get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });
  //2 if toke hasnt expired and ther e is user, set the new pass
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  //3 update changedpasswordat property for the user

  //4 log the user and send jwt
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});
