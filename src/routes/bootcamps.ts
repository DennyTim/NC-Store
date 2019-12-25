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

// model
import Bootcamp from '../models/Bootcamp';

// Include other resource routers
import courseRouter from './courses';

const router = express.Router();

router.route('/')
      .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
      .post(createBootcamp);
router.route('/:id')
      .get(getBootcamp)
      .put(updateBootcamp)
      .delete(deleteBootcamp);
router.route('/radius/:zipcode/:distance')
      .get(getBootcampsInRadius);
router.route('/:id/photo')
      .put(bootcampPhotoUpload);

// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);

export default router;
