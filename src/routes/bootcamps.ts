import express from 'express';
import {
  createBootcamp,
  deleteBootcamp,
  getBootcamp,
  getBootcamps,
  updateBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload,
} from '../controllers/bootcamps';

// middleware
import { advancedResults } from '../middleware/advanced-results';
import {
  protect,
  authorize,
} from '../middleware/auth';

// model
import Bootcamp from '../models/Bootcamp';

// Include other resource routers
import courseRouter from './courses';
import reviewsRouter from './reviews';

const router = express.Router();

router.route('/')
      .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
      .post(protect, authorize('publisher', 'admin'), createBootcamp);
router.route('/:id')
      .get(getBootcamp)
      .put(protect, authorize('publisher', 'admin'), updateBootcamp)
      .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);
router.route('/radius/:zipcode/:distance')
      .get(getBootcampsInRadius);
router.route('/:id/photo')
      .put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewsRouter);

export default router;
