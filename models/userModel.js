const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    // see the validate in the tourModal too
    // we can also use obj in the validate to setup a custom validation func
    // we pass 2 things to validate, a validation func, and error message
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  //   photo: { type: String },
  //   see the tour modal for how we added images to there .
  photo: { type: String, default: 'defalut.jpg' },
  role: {
    type: String,
    enum: ['user', 'tour-guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must have 8 characters'],
    // it will not come in res when quering  for  get all users but it will come in res of the sign up query
    // as we send user in res there too
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // this only works for the save query not for update
      // so we have to update the user we call save query and then the update query
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  // to activate and deactivate any users account
  //  we will hide this filed from the user api response
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// pre middleware run bw the request/ when we receive the data and the additon of data into the database
// so thats the prefect time to manipulate the data
userSchema.pre('save', async function (next) {
  // 1
  // only run the func when password is modified and not the name or any other field
  if (!this.isModified('password')) return next();

  //   2
  // encrypt the pass with hash
  //  see the 127 vid from 10:10 to understand how bcrypt encrypts the pass
  //  this =>  hash(this.password, 12) return a promise, 12 here is the cost of cpu encrpyt the password
  this.password = await bcrypt.hash(this.password, 12);

  //   3
  //   delete a field from database, not be presisted in db
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  // if pass is modified or its a new pass entry in db
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// **********************************************************************//
// QUERY MIDDLEWARE
// we can specify the query like find save etc but we can also give a regular expression here
//  to say that all the query's that starts with find will run this query middleware
// userSchema.pre('find', function(next){
userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } }); // so all the documents/data of user where active is not equal to false should come in the getAllUsers query
  next();
});
// ************************************************************************//

// if we remove a certain field from the output of a get query of a schema we cannot use this.password as we have
// hidden it
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
//

userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimeStamp;
  }
  // false means not changed
  return false;
};
//

userSchema.methods.createPasswordResetToken = function () {
  // the token is a random string , but it needs not to be a heavy encrypted string
  //  we should never store the plain reset token in the db to protect agains the hackers
  const resetToken = crypto.randomBytes(32).toString('hex');
  // encrypted reset token
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
const User = mongoose.model('User', userSchema);

module.exports = User;
