import jwt from 'jsonwebtoken';
import { Router, type Request, type Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { login, register } from '../controllers/auth.controller.js';

const authRouter = Router();
const prisma = new PrismaClient();

// Helper route to generate a token for any user ID (for testing purposes)
authRouter.post('/auth/token', async (req, res) => {
      const { userId } = req.body;
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
            res.status(404).json({ error: 'User not found in database' });
            return;
      }

      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'supersecretkey', {
            expiresIn: '7d'
      });

      res.json({ token });
});

//REGISTER USER
authRouter.post('/auth/register', register);

//LOGIN USER
authRouter.post('/auth/login', login);

export default authRouter;