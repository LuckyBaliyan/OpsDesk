import type { Request, Response, NextFunction } from 'express';
import pkg from 'jsonwebtoken';
const { verify } = pkg; // Destructure verify safely
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export interface AuthenticatedRequest extends Request {
      user?: {
            id: string;
            email: string;
      };
}

// 1. JWT Authentication Middleware
export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
            const authHeader = req.headers['authorization'];

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                  res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
                  return;
            }

            const token = authHeader.split(' ')[1];
            if (!token) {
                  res.status(401).json({ error: 'Unauthorized: Missing token' });
                  return;
            }
            const decoded = verify(token, JWT_SECRET) as unknown as { id: string; email: string };

            const user = await prisma.user.findUnique({ where: { id: decoded.id } });
            if (!user) {
                  res.status(401).json({ error: 'Unauthorized: User not found' });
                  return;
            }

            req.user = { id: user.id, email: user.email };
            next();

      } catch (error) {
            console.error("JWT Verification Error:", (error as Error).message);
            res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
      }
};

// 2. Team Role-Based Access Control (RBAC) Middleware
export const requireTeamRole = (allowedRoles: string[]) => {
      return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
            try {
                  const userId = req.user?.id;
                  const teamId = req.params.teamId || req.body.teamId;

                  if (!teamId) {
                        res.status(400).json({ error: 'Bad Request: teamId is required for authorization' });
                        return;
                  }

                  const membership = await prisma.teamMembership.findUnique({
                        where: {
                              userId_teamId: { userId: userId!, teamId }
                        }
                  });

                  if (!membership || !allowedRoles.includes(membership.role)) {
                        res.status(403).json({ error: 'Forbidden: You do not have the required permissions for this team' });
                        return;
                  }

                  next();
            } catch (error) {
                  res.status(500).json({ error: 'Internal Server Error during authorization' });
            }
      };
};