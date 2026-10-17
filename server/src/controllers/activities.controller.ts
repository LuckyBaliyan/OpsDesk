import type { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

const prisma = new PrismaClient();

// Get audit logs / activity events for a specific work item with pagination
export const getWorkItemActivities = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
            const { workItemId } = req.params as { workItemId: string };
            const { page = '1', limit = '10' } = req.query;
            const userId = req.user!.id;

            const pageNumber = parseInt(page as string, 10);
            const pageSize = parseInt(limit as string, 10);
            const skip = (pageNumber - 1) * pageSize;

            // Verify work item exists and get teamId
            const workItem = await prisma.workItem.findUnique({
                  where: { id: workItemId },
                  select: { teamId: true }
            });

            if (!workItem) {
                  res.status(404).json({ error: 'Work item not found' });
                  return;
            }

            // Verify team membership
            const membership = await prisma.teamMembership.findUnique({
                  where: { userId_teamId: { userId, teamId: workItem.teamId } }
            });

            if (!membership) {
                  res.status(403).json({ error: 'Forbidden: You do not have access to this team' });
                  return;
            }

            // Fetch paginated activity events and total count atomically
            const [activities, totalCount] = await prisma.$transaction([
                  prisma.activityEvent.findMany({
                        where: { workItemId },
                        include: {
                              actor: { select: { id: true, name: true, email: true } }
                        },
                        orderBy: { createdAt: 'desc' }, // Naye events sabse upar dikhenge
                        skip: skip,
                        take: pageSize
                  }),
                  prisma.activityEvent.count({ where: { workItemId } })
            ]);

            res.json({
                  data: activities,
                  pagination: {
                        total: totalCount,
                        page: pageNumber,
                        limit: pageSize,
                        totalPages: Math.ceil(totalCount / pageSize)
                  }
            });
      } catch (error) {
            console.error('Get Activities Error:', error);
            res.status(500).json({ error: 'Failed to fetch activity logs' });
      }
};