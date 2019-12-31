import express from 'express';

// Controller
import {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} from '../controllers/users';

// Middleware
import {
  protect,
  authorize,
} from '../middleware/auth';
import { advancedResults } from '../middleware/advanced-results';

// Models/utils
import User from '../models/User';

const router = express.Router({ mergeParams: true });

router.use(protect);
router.use(authorize('admin'));

router.route('/')
      .get(advancedResults(User), getUsers)
      .post(createUser);

router.route('/:id')
      .get(getUser)
      .put(updateUser)
      .delete(deleteUser);

export default router;
