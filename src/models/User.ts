import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import {
  Document,
  model,
  Schema,
} from 'mongoose';


// tslint:disable-next-line:interface-name
export interface UserModel extends Document {
  name: any;
  email: any;
  role: any;
  password: any;
  resetPasswordToken: any;
  resetPasswordExpire: any;
  createdAt: any;
  getSignedJwtToken: () => {};
  getResetPasswordToken: () => {};
  matchPassword: ( p: string ) => {};
}

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: [ true, 'Please add a name' ],
  },
  email: {
    type: String,
    required: [ true, 'Please add an email' ],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  role: {
    type: String,
    enum: [ 'user', 'publisher', 'admin' ],
    default: 'user',
  },
  password: {
    type: String,
    required: [ true, 'Please add a password' ],
    minlength: 6,
    select: false,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password using bcrypt
UserSchema.pre<UserModel>('save', async function( next ) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { _id: this._id },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRE },
  );
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = function( enteredPassword ) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20)
                           .toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto.createHash('sha256')
                                  .update(resetToken)
                                  .digest('hex');

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

export default model<UserModel>('User', UserSchema);
