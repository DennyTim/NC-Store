import {
  NextFunction,
  Request,
  Response,
} from 'express';
import ErrorResponse from '../utils/errorResponse';

export const errorHandler = ( err, req: Request, res: Response, next: NextFunction ) => {
  let error = { ...err };

  error.message = err.message;

  // Log to console for dev
  global.console.log(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Bootcamp not found with id of ${ err.value }`;
    error = new ErrorResponse(message, 404);
  }

  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
                          .map(( val: any ) => val.message).join(', ');
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500)
     .json({
       success: false,
       error: error.message || 'Server Error',
     });
};
