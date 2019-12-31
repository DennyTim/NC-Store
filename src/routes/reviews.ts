import express from 'express';
import {
  addReview,
  getReview,
  getReviews,
} from '../controllers/reviews';
// middlewares
import { advancedResults } from '../middleware/advanced-results';
import {
  authorize,
  protect,
} from '../middleware/auth';
// models
import Reviews from '../models/Reviews';
// import {
//   protect,
//   authorize,
// } from '../middleware/auth';

const router = express.Router({ mergeParams: true });

router.route('/')
      .get(advancedResults(Reviews, {
        path: 'bootcamp',
        select: 'name description',
      }), getReviews)
      .post(protect, authorize('user', 'admin'), addReview);

router.route('/:id')
      .get(getReview);

export default router;
