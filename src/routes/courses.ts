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

// models
import Course from '../models/Course';

const router = express.Router({ mergeParams: true });

router.route('/')
      .get(advancedResults(Course, {
        path: 'bootcamp',
        select: 'name description',
      }), getCourses)
      .post(addCourse);
router.route('/:id')
      .get(getCourse)
      .put(updateCourse)
      .delete(deleteCourse);

export default router;
