import { NextFunction } from 'express';
// Middleware
import { asyncHandler } from '../middleware/async';
// Models
import User from '../models/User';
// Custom utils/models
import { ModifiedRequest } from './models/modified-request.model';
import { ModifiedResponse } from './models/modified-response.model';


/**
 *  @desc     Get all user
 *  @route    GET /api/v1/auth/users
 *  @access   Private/Admin
 */
export const getUsers = asyncHandler(async (
  req: ModifiedRequest,
  res: ModifiedResponse,
  next: NextFunction,
) => {
  res.status(200)
     .json(res.advancedResults);
});

/**
 *  @desc     Get single user
 *  @route    GET /api/v1/auth/users/:id
 *  @access   Private/Admin
 */
export const getUser = asyncHandler(async (
  req: ModifiedRequest,
  res: ModifiedResponse,
  next: NextFunction,
) => {
  const user = await User.findById(req.params.id);


  res.status(200)
     .json({
       success: true,
       data: user,
     });
});

/**
 *  @desc     Create single user
 *  @route    POST /api/v1/auth/users
 *  @access   Private/Admin
 */
export const createUser = asyncHandler(async (
  req: ModifiedRequest,
  res: ModifiedResponse,
  next: NextFunction,
) => {
  const user = await User.create(req.body);

  global.console.log(user);

  res.status(201)
     .json({
       success: true,
       data: user,
     });
});

/**
 *  @desc     Update single user
 *  @route    PUT /api/v1/auth/users/:id
 *  @access   Private/Admin
 */
export const updateUser = asyncHandler(async (
  req: ModifiedRequest,
  res: ModifiedResponse,
  next: NextFunction,
) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200)
     .json({
       success: true,
       data: user,
     });
});

/**
 *  @desc     Delete single user
 *  @route    DELETE /api/v1/auth/users/:id
 *  @access   Private/Admin
 */
export const deleteUser = asyncHandler(async (
  req: ModifiedRequest,
  res: ModifiedResponse,
  next: NextFunction,
) => {
  await User.findByIdAndDelete(req.params.id);

  res.status(200)
     .json({
       success: true,
       data: {},
     });
});
