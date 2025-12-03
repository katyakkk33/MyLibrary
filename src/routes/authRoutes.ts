import { Router } from 'express';
import { register, login } from '../controllers/authController';

const router = Router();

// POST /register
router.post('/register', register);

// POST /login
router.post('/login', login);

export default router;
