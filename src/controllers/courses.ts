import {
  NextFunction,
  Request,
  Response,
} from 'express';

// Middleware
import { asyncHandler } from '../middleware/async';
import Bootcamp from '../models/Bootcamp';

// Mongoose models
import Course from '../models/Course';

// Custom utils/models
import ErrorResponse from '../utils/errorResponse';
import { ModifiedRequest } from './models/modified-request.model';
import { ModifiedResponse } from './models/modified-response.model';

/**
 *  @desc     Get all courses
 *  @route    GET /api/v1/courses
 *  @route    GET /api/v1/bootcamps/:bootcampId/courses
 *  @access   Public
 */

export const getCourses = asyncHandler(async (
  req: Request,
  res: ModifiedResponse,
  next: NextFunction,
) => {
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });
    return res.status(200)
              .json({
                success: true,
                count: courses.length,
                data: courses,
              });

  } else {
    return res.status(200)
              .json(res.advancedResults);
  }
});

/**
 *  @desc     Get single course
 *  @route    GET /api/v1/courses/:id
 *  @access   Public
 */

export const getCourse = asyncHandler(async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const course = await Course.findById(req.params.id)
                             .populate({
                               path: 'bootcamp',
                               select: 'name description',
                             });

  if (!course) {
    return next(new ErrorResponse(`No course with the id of ${ req.params.id }`, 404));
  }

  res.status(200)
     .json({
       success: true,
       data: course,
     });
});

/**
 *  @desc     Add single course
 *  @route    POST /api/v1/bootcamps/:bootcampId/courses
 *  @access   Private
 */

export const addCourse = asyncHandler(async (
  req: ModifiedRequest,
  res: ModifiedResponse,
  next: NextFunction,
) => {
  req.body.bootcamp = req.params.bootcampId;
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (req.user) {
    // Add user req.body
    req.body.user = req.user.id;
  }

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `No course with the id of ${ req.params.bootcampId }`,
        404,
      ),
    );
  }

  if (req.user && bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${ req.user.name } is not authorized to add a course to bootcamp ${ bootcamp._id }`,
        401,
      ),
    );
  }

  const course = await Course.create(req.body);

  res.status(200)
     .json({
       success: true,
       data: course,
     });
});

/**
 *  @desc     Update course
 *  @route    PUT /api/v1/courses/:id
 *  @access   Private
 */
export const updateCourse = asyncHandler(async (
  req: ModifiedRequest,
  res: ModifiedResponse,
  next: NextFunction,
) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(
        `No course found with the id of ${ req.params.id }`,
        404,
      ),
    );
  }

  if (req.user && course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${ req.user.name } is not authorized to update course ${ course._id }`,
        401,
      ),
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200)
     .json({
       success: true,
       data: course,
     });
});

/**
 *  @desc     Delete course
 *  @route    DELETE /api/v1/courses/:id
 *  @access   Private
 */
export const deleteCourse = asyncHandler(async (
  req: ModifiedRequest,
  res: ModifiedResponse,
  next: NextFunction,
) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(
        `No course found with the id of ${ req.params.id }`,
        404,
      ),
    );
  }

  if (req.user && course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${ req.user.name } is not authorized to delete course ${ course._id }`,
        401,
      ),
    );
  }

  await Course.findByIdAndDelete(req.params.id);

  res.status(200)
     .json({
       success: true,
       data: {},
     });
});

