const AppError = require('../utils/appError');
const User = require('./../models/userModel');
const catchAsynch = require('./../utils/catchAsynch');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsynch(async (req, res, next) => {
  const users = await User.find();
  //send respons
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.updateMe = catchAsynch(async (req, res, next) => {
  //1 create error if user posts password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'this route is not for password update please use /updateMyPassword',
        400
      )
    );
  }
  //2 update user document
  const filteredBody = filterObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status:'success',
    data:{
      user:updatedUser
    }
  })
});
exports.deleteMe=catchAsynch(async(req,res,next)=>{
  await User.findByIdAndUpdate(req.user.id,{active:false})
  res.status(204).json({
    status:'success',
    data:null
  })
})
exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this rout is not defined yet',
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this rout is not defined yet',
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this rout is not defined yet',
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this rout is not defined yet',
  });
};
