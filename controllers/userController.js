const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// save image to the disk rightaway -- when editing the image its best to store it to the memory not disk
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     // user-454545dfdsfd-33262585.jpeg
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

// now the image will be stored as a buffer
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

// this is multer configuration obj
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = factory.getAll(User);
// old controller befre factory func
// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   const users = await User.find();
//   res
//     .status(200)
//     .json({ status: 'success', results: users.length, data: users });
// });

exports.upadateMe = catchAsync(async (req, res, next) => {
  // console.log(req.file);
  // console.log(req.body);
  // 1) Create errorif user posts password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400
      )
    );
  }
  // 2) update user document
  // here some malicious user could change the role to admin we need to prevent that
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: { user: updatedUser },
  });
});
// this is when te user delete himself not the admin
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'Success',
    data: null,
  });
});
exports.getUser = factory.getOne(User);
// exports.getUser = (req, res) => {
//   res
//     .status(500)
//     .json({ status: 'error', message: 'This rote is not yet defined!' });
// };

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This rote is not yet defined! Please use /signup instead',
  });
};
// the common func for delete vid16 2it is implemeted lateer than the below old delete code
// Do NOT update passwords with this!

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateUser = factory.updateOne(User);
// exports.updateUser = (req, res) => {
//   res
//     .status(500)
//     .json({ status: 'error', message: 'This rote is not yet defined!' });
// };
// the common func for delete vid161 it is implemeted lateer than the below old delete code
exports.deleteUser = factory.deleteOne(User);

// exports.deleteUser = (req, res) => {
//   res
//     .status(500)
//     .json({ status: 'error', message: 'This rote is not yet defined!' });
// };
