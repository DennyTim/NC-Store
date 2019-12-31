import express from 'express';
import {
  getMe,
  login,
  register,
  resetPassword,
  forgotPassword,
  updateDetails,
  updatePassword,
} from '../controllers/auth';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/me', protect, getMe);
router.post('/login', login);
router.post('/register', register);
router.post('/forgotPassword', forgotPassword);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatePassword', protect, updatePassword);
router.put('/resetpassword/:resettoken', resetPassword);

export default router;
