import { NextFunction } from 'express';
import Bootcamp from '../models/Bootcamp';
import { ModifiedResponse } from './models/modified-response.model';
import { ModifiedRequest } from './models/modified-request.model';

// Middleware
import { asyncHandler } from '../middleware/async';

// Models/utils
import Reviews from '../models/Reviews';
import ErrorResponse from '../utils/errorResponse';

/**
 *  @desc     Get all courses
 *  @route    GET /api/v1/reviews
 *  @route    GET /api/v1/bootcamps/:bootcampId/reviews
 *  @access   Public
 */
export const getReviews = asyncHandler(async (
  req: ModifiedRequest,
  res: ModifiedResponse,
  next: NextFunction,
) => {
  if (req.params.bootcampId) {
    const reviews = await Reviews.find({ bootcamp: req.params.bootcampId });

    return res.status(200)
              .json({
                success: true,
                count: reviews.length,
                data: reviews,
              });
  } else {
    return res.status(200)
              .json(res.advancedResults);
  }
});

/**
 *  @desc     Get single review
 *  @route    GET /api/v1/reviews/:id
 *  @access   Public
 */
export const getReview = asyncHandler(async (
  req: ModifiedRequest,
  res: ModifiedResponse,
  next: NextFunction,
) => {

  const review = await Reviews.findById(req.params.id)
                              .populate({
                                path: 'bootcamp',
                                select: 'name description',
                              });

  if (!review) {
    return next(
      new ErrorResponse(
        `No review found with the id of ${ req.params.id }`,
        404,
      ),
    );
  }

  res.status(200)
     .json({
       success: true,
       data: review,
     });
});

/**
 *  @desc     Add review
 *  @route    POST /api/v1/bootcamps/:bootcampId/reviews
 *  @access   Private
 */
export const addReview = asyncHandler(async (
  req: ModifiedRequest,
  res: ModifiedResponse,
  next: NextFunction,
) => {
  req.body.bootcamp = req.params.bootcampId;

  if (req.user) {
    req.body.user = req.user.id;
  }

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `No bootcamp with the id of ${ req.params.bootcampId }`,
        404,
      ),
    );
  }

  const review = await Reviews.create(req.body);

  res.status(201)
     .json({
       success: true,
       data: review,
     });
});
