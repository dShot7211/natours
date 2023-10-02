/* eslint-disable arrow-body-style */
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const { userInfo } = require('os');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60 * 60 * 1000
    ),

    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  // remove the password from the output
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

// old sending res method every func hastry and acatch so we simplified it [catchAsync]
exports.testSign = async (req, res) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      passwordChangedAt: req.body.passwordChangedAt,
      role: req.body.role,
    });
    // send res
    res.status(200).json({
      status: 'Success',
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });
  const url = `${req.portocol}://${req.get('host')}/me`;
  console.log(url);
  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1 we check if the the req body has email and pass or not
  if (!email || !password) {
    return next(new AppError('Please Provide email and password', 400));
  }
  // 2 check if the user exists
  // we hide the password from all the get routes of users in user modal, so here as well we will not get the password
  // in the findOne method  IE const user will not contain  password key value, so to get that explicitly we haveto (+password)
  const user = await User.findOne({ email: email }).select('+password');
  // correctPassword is a instance method we defined in the user modal as this method is on user instance we can use it like this
  // it is available on all the user documents
  // const correct = ;

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  // 3 if everythig is ok send the token to user
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'null', {
    expires: new Date(Date.now() - 10 * 1000),
    httpOnly: true,
  });
  // res.cookie('jwt', 'loggedout', {
  //   expires: new Date(Date.now() + 10 * 1000),
  //   httpOnly: true,
  // });
  res.status(200).json({ status: 'success' });
};

// a middleware function for protected routes. this function puts the user on the request obj
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // 1  Getting token and checking if it's there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please login to get access', 401)
    );
  }
  //
  // 2 => Verification the token => the verify method of jwt see vid 132 2:34
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); //  here we just modified this jwt.verify method to return a promise , cause we dont want to break our pattern of promise functions
  // const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // decoded { id: '63dfd517b5977b0cd08acd74', iat: 1675613464, exp: 1675699864 }

  //==> two security cases
  //==  if the user still exists (if it is deleted in the token expire time frame then we do not want to login user)
  //==  if the user has changed the  password. we want to the user to login again and get new token(this will nullify the case where someone got token illegitimate way and the originaluser changes the pass and then the hacker cant do anything with the old token
  //  => above point explaination (suppose if someone stole jwt token of someone and to counter it the user changed its password ,then the user should get new jwt token so the old one that the hacker has becomes invallid)
  // 3 => Check if the user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exists.',
        401
      )
    );
  }

  // 4 =>Check if the user changed password after the token was issued
  // to do this we will implement instance method ie: method on the all the documents/instances of all the modals, because we have to do lot of code so its best to do in the usermodel
  // console.log(freshUser.changePasswordAfter(decoded.iat));
  // console.log(decoded);
  if (freshUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password. Please login again!', 401)
    );
  }
  // GRANT ACCESS TO PROTECTD ROUTES
  req.user = freshUser;
  next();
});

// only for rendered pages, no errors!
// exports.isLoggedIn = catchAsync(async (req, res, next) => {
//   // 1  Getting token and checking if it's there
//   if (req.cookies.jwt) {
//     const decoded = await promisify(jwt.verify)(
//       req.cookies.jwt,
//       process.env.JWT_SECRET
//     );
//     const freshUser = await User.findById(decoded.id);
//     if (!freshUser) {
//       return next();
//     }

//     if (freshUser.changePasswordAfter(decoded.iat)) {
//       return next();
//     }
//     // THERE IS A LOGGED IN USER
//     res.locals.user = freshUser;

//     return next();
//   }
//   next();
// });
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changePasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1 get user based on Posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address', 404));
  }
  //2  generate the random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //3  send it back as an email

  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Your password reset token (valid for 10 minutes)',
    //   message,
    // });
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();
    res
      .status(200)
      .json({ status: 'success', message: 'Token sent to email!' });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 3) Upadte changedpasswordAt property for the user

  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection

  const user = await User.findById(req.user.id).select('+password');

  // 2) Checkif the Posted current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }
  // 3) If, so update Password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});
