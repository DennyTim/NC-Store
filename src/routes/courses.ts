import express from 'express';
import {
  addCourse,
  deleteCourse,
  getCourse,
  getCourses,
  updateCourse,
} from '../controllers/courses';

// middlewares
import { advancedResults } from '../middleware/advanced-results';
import { protect, authorize } from '../middleware/auth';

// models
import Course from '../models/Course';

const router = express.Router({ mergeParams: true });

router.route('/')
      .get(advancedResults(Course, {
        path: 'bootcamp',
        select: 'name description',
      }), getCourses)
      .post(protect, authorize('publisher', 'admin'), addCourse);
router.route('/:id')
      .get(getCourse)
      .put(protect, authorize('publisher', 'admin'), updateCourse)
      .delete(protect, authorize('publisher', 'admin'), deleteCourse);

export default router;
