import { Router } from 'express';
import { getUsers } from '../controllers/users.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const userRouter = Router();

// Saare users ki list ya search karne ke liye
userRouter.get('/users', requireAuth, getUsers);

export default userRouter;