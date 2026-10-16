import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import pkg from 'jsonwebtoken';
const { sign } = pkg;

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// 1. Register Logic
export const register = async (req: Request, res: Response): Promise<void> => {
      try {
            const { email, password, name } = req.body;

            if (!email || !password) {
                  res.status(400).json({ error: 'Email and password are required' });
                  return;
            }

            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                  res.status(400).json({ error: 'User with this email already exists' });
                  return;
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await prisma.user.create({
                  data: {
                        email,
                        password: hashedPassword,
                        name: name || 'OpsHub User'
                  }
            });

            res.status(201).json({
                  message: 'User registered successfully',
                  user: {
                        id: user.id,
                        email: user.email,
                        name: user.name
                  }
            });
      } catch (error) {
            console.error('Registration Error:', error);
            res.status(500).json({ error: 'Internal server error during registration' });
      }
};

// 2. Login Logic
export const login = async (req: Request, res: Response): Promise<void> => {
      try {
            const { email, password } = req.body;

            if (!email || !password) {
                  res.status(400).json({ error: 'Email and password are required' });
                  return;
            }

            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                  res.status(401).json({ error: 'Invalid email or password' });
                  return;
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                  res.status(401).json({ error: 'Invalid email or password' });
                  return;
            }

            const token = sign(
                  { id: user.id, email: user.email },
                  JWT_SECRET,
                  { expiresIn: '1d' }
            );

            res.json({
                  message: 'Login successful',
                  token,
                  user: {
                        id: user.id,
                        email: user.email,
                        name: user.name
                  }
            });
      } catch (error) {
            console.error('Login Error:', error);
            res.status(500).json({ error: 'Internal server error during login' });
      }
};