import {
  NextFunction,
  Request,
  Response,
} from 'express';
import crypto from 'crypto';

// Models
import User, { UserModel } from '../models/User';

// Middleware
import { asyncHandler } from '../middleware/async';
import { ModifiedRequest } from './models/modified-request.model';
import { ModifiedResponse } from './models/modified-response.model';

// Custom utils/models
import { sendEmail } from '../utils/sendEmail';
import ErrorResponse from '../utils/errorResponse';

/**
 *  @desc     Register user
 *  @route    POST /api/v1/auth/register
 *  @access   Public
 */
export const register = asyncHandler(async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  sendTokenResponse(user, 200, res);
});

/**
 *  @desc     Login user
 *  @route    POST /api/v1/auth/login
 *  @access   Public
 */
export const login = asyncHandler(async ( req: Request, res: Response, next: NextFunction ) => {

  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(
      new ErrorResponse(
        'Please provide an email and password',
        400,
      ),
    );
  }

  // Check for user
  const user = await User.findOne({ email })
                         .select('+password');
  if (!user) {
    return next(
      new ErrorResponse(
        'Invalid credentials',
        401,
      ),
    );
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

/**
 *  @desc     Get current logged in user
 *  @route    POST /api/v1/auth/me
 *  @access   Private
 */
export const getMe = asyncHandler(async (
  req: ModifiedRequest,
  res: ModifiedResponse,
  next: NextFunction,
) => {
  if (req.user) {
    const user = await User.findById(req.user.id);
    return res.status(200)
              .json({
                success: true,
                data: user,
              });
  } else {
    return next(new ErrorResponse('User not found', 404));
  }
});

/**
 *  @desc     Update user details
 *  @route    PUT /api/v1/auth/updatedetails
 *  @access   Private
 */
export const updateDetails = asyncHandler(async (
  req: ModifiedRequest,
  res: ModifiedResponse,
  next: NextFunction,
) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  let user;

  if (req.user) {
    user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });
  }

  res.status(200)
     .json({
       success: true,
       data: user,
     });
});

/**
 *  @desc     Update password
 *  @route    PUT /api/v1/auth/updatePassword
 *  @access   Private
 */
export const updatePassword = asyncHandler(async (
  req: ModifiedRequest,
  res: ModifiedResponse,
  next: NextFunction,
) => {
  let user;
  if (req.user) {
    user = await User.findById(req.user.id)
                     .select('+password');

    // Check current password
    if (user && !(await user.matchPassword(req.body.currentPassword))) {
      return next(new ErrorResponse('Password is incorrect', 401));
    }

    if (user) {
      user.password = req.body.newPassword;
      await user.save();
      sendTokenResponse(user, 200, res);
    }
  }
});

/**
 *  @desc     Get current logged in user
 *  @route    PUT /api/v1/auth/resetpassword/:resettoken
 *  @access   Private
 */
export const resetPassword = asyncHandler(async (
  req: ModifiedRequest,
  res: ModifiedResponse,
  next: NextFunction,
) => {
  const resetPasswordToken = crypto.createHash('sha256')
                                   .update(req.params.resettoken)
                                   .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

/**
 *  @desc     Forgot password
 *  @route    POST /api/v1/auth/forgotpassword
 *  @access   Public
 */
export const forgotPassword = asyncHandler(async (
  req: ModifiedRequest,
  res: ModifiedResponse,
  next: NextFunction,
) => {

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${ req.protocol }://${ req.get(
    'host',
  ) }/api/v1/auth/resetpassword/${ resetToken }`;

  const message = `
    You are receiving this email because you (or someone else)
    has requested the reset of password. Please make a PUT request
    to: \n\n ${ resetUrl }
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message,
    });
    return res.status(200)
              .json({
                success: true,
                data: 'Email sent',
              });
  } catch (err) {
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }
});


// Get token from model, create cookie and send response
const sendTokenResponse = ( user: UserModel, statusCode: number, res: Response ) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + Number(process.env.JWT_COOKIE_EXPIRE!) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: false,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(statusCode)
     .cookie('token', token, options)
     .json({
       success: true,
       token,
     });
};

