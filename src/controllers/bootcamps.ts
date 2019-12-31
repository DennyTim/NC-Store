import {
  NextFunction,
  Request,
  Response,
} from 'express';
import path from 'path';

// Types
import { UploadedFile } from 'express-fileupload';

// Middleware
import { asyncHandler } from '../middleware/async';

// Mongoose models
import Bootcamp from '../models/Bootcamp';

// Custom utils/models
import ErrorResponse from '../utils/errorResponse';
import geocoder from '../utils/geocoder';
import { ModifiedRequest } from './models/modified-request.model';
import { ModifiedResponse } from './models/modified-response.model';

/**
 *  @desc     Get all bootcamps
 *  @route    GET /api/v1/bootcamps
 *  @access   Public
 */
export const getBootcamps = asyncHandler(async (
  req: Request,
  res: ModifiedResponse,
  next: NextFunction,
) => {

  res.status(200)
     .json(res.advancedResults);
});

/**
 *  @desc     Get single bootcamp
 *  @route    GET /api/v1/bootcamps/:id
 *  @access   Public
 */
export const getBootcamp = asyncHandler(async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${ req.params.id }`, 404),
    );
  }

  res.status(200)
     .json({
       success: true,
       data: bootcamp,
     });
});

/**
 *  @desc     Create new bootcamp
 *  @route    POST /api/v1/bootcamps
 *  @access   Private
 */
export const createBootcamp = asyncHandler(async (
  req: ModifiedRequest,
  res: ModifiedResponse,
  next: NextFunction,
) => {
  if (req.user) {
    // Add user req.body
    req.body.user = req.user.id;
    // Check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });
    // if the user is not an admin, they can only add one bootcamp
    if (publishedBootcamp && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `The user with ID ${ req.user.id } has already published a bootcamp`,
          400,
        ),
      );
    }
  }

  const bootcamp = await Bootcamp.create(req.body);
  res.status(201)
     .json({
       success: true,
       data: bootcamp,
     });
});

/**
 *  @desc     Update exist bootcamp
 *  @route    PUT /api/v1/bootcamps/:id
 *  @access   Private
 */
export const updateBootcamp = asyncHandler(async (
  req: ModifiedRequest,
  res: ModifiedResponse,
  next: NextFunction,
): Promise<any> => {
  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${ req.params.id }`, 404),
    );
  }

  // Make sure user is bootcamp owner
  if (req.user && bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${ req.params.id } is not authorized to update this bootcamp`,
        401,
      ),
    );
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(bootcamp.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200)
     .json({
       data: bootcamp,
       success: true,
     });
});

/**
 *  @desc     Delete exist bootcamp
 *  @route    DELETE /api/v1/bootcamps/:id
 *  @access   Private
 */
export const deleteBootcamp = asyncHandler(async (
  req: ModifiedRequest,
  res: ModifiedResponse,
  next: NextFunction,
): Promise<any> => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${ req.params.id }`, 404),
    );
  }

  // Make sure user is bootcamp owner
  if (req.user && bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${ req.params.id } is not authorized to delete this bootcamp`,
        401,
      ),
    );
  }

  bootcamp.remove();

  res.status(200)
     .json({
       data: {},
       success: true,
     });
});

/**
 *  @desc     Get bootcamps within a radius
 *  @route    GET /api/v1/bootcamps/radius/:zipcode/:distance
 *  @access   Private
 */
export const getBootcampsInRadius = asyncHandler(async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const { zipcode, distance } = req.params;

  // Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;
  // Calc radius using radians
  // Divide dist by radius of earth
  // Earth Radius = 3,963 mi / 6,378 km
  const radius = +distance / 3963;
  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [ [ lng, lat ], radius ] } },
  });

  res.status(200)
     .json({
       success: true,
       count: bootcamps.length,
       data: bootcamps,
     });
});

/**
 *  @desc     Upload photo for bootcamp
 *  @route    PUT /api/v1/bootcamps/:id/photo
 *  @access   Private
 */
export const bootcampPhotoUpload = asyncHandler(async (
  req: ModifiedRequest,
  res: ModifiedResponse,
  next: NextFunction,
): Promise<any> => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${ req.params.id }`, 404),
    );
  }

  // Make sure user is bootcamp owner
  if (req.user && bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${ req.params.id } is not authorized to delete this bootcamp`,
        401,
      ),
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file as UploadedFile;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check filesize
  if (process.env.MAX_FILE_UPLOAD && file.size > +process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${ process.env.MAX_FILE_UPLOAD }`,
        400,
      ),
    );
  }

  file.name = `photo_${ bootcamp._id }${ path.parse(file.name).ext }`;
  file.mv(`${ process.env.FILE_UPLOAD_PATH }/${ file.name }`, async ( err ) => {

    if (err) {
      global.console.error(err);
      return next(
        new ErrorResponse(
          `Problem with file upload`,
          500,
        ),
      );
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200)
       .json({
         success: true,
         data: file.name,
       });
  });

});
