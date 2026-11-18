import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import type { Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Fetches all users with optional name/email search and team filter.
 * Returns user details, creation date, and team memberships for directory view.
 */
export const getUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
            const { search, teamId } = req.query;
            const whereClause: any = {};

            // Search filter by user name or email address
            if (search && (search as string).trim() !== '') {
                  whereClause.OR = [
                        { name: { contains: search as string, mode: 'insensitive' } },
                        { email: { contains: search as string, mode: 'insensitive' } }
                  ];
            }

            // Optional filter by specific team membership
            if (teamId && teamId !== 'all') {
                  whereClause.memberships = {
                        some: {
                              teamId: teamId as string
                        }
                  };
            }

            // Fetch users with memberships and associated team details
            const users = await prisma.user.findMany({
                  where: whereClause,
                  select: {
                        id: true,
                        name: true,
                        email: true,
                        createdAt: true,
                        memberships: {
                              select: {
                                    id: true,
                                    role: true,
                                    teamId: true,
                                    team: {
                                          select: {
                                                id: true,
                                                name: true
                                          }
                                    }
                              }
                        }
                  },
                  orderBy: { name: 'asc' }
            });

            res.json(users);
      } catch (error) {
            console.error('Get Users Error:', error);
            res.status(500).json({ error: 'Failed to fetch users' });
      }
};