import {
  NextFunction,
  RequestHandler,
} from 'express';
import jwt from 'jsonwebtoken';
import { ModifiedRequest } from '../controllers/models/modified-request.model';
import { ModifiedResponse } from '../controllers/models/modified-response.model';
import User from '../models/User';
import ErrorResponse from '../utils/errorResponse';
import { asyncHandler } from './async';

// tslint:disable-next-line:interface-name
interface DecodedModel {
  [key: string]: any;

  _id?: string;
}

export const protect = asyncHandler(
  async (
    req: ModifiedRequest,
    res: ModifiedResponse,
    next: NextFunction,
  ) => {
    let token;
    if (
      req.headers.authorization && req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    // else if (req.cookies.token) {
    //  token = req.cookies.token;
    // }

    // Make  sure token exists
    if (!token) {
      return next(new ErrorResponse('Not authorize to access this route', 401));
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      req.user = await User.findById((<DecodedModel> decoded)._id);
      next();
    } catch (err) {
      return next(new ErrorResponse('Not authorize to access this route', 401));
    }
  },
);

// Grant access to specific roles
export const authorize = ( ...roles: string[] ): RequestHandler =>
  ( req: ModifiedRequest, res: ModifiedResponse, next: NextFunction ) => {
    if (req.user && !roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(`User role ${ req.user.role } is unauthorized to access this route`,
          401,
        ),
      );
    }

    next();
  };
