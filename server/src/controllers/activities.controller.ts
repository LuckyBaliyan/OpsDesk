import type { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

const prisma = new PrismaClient();

// Get audit logs / activity events for a specific work item
export const getWorkItemActivities = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { workItemId } = req.params as { workItemId: string };
        const userId = req.user!.id;

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

        // Fetch activity events for this work item
        const activities = await prisma.activityEvent.findMany({
            where: { workItemId },
            include: {
                actor: { select: { id: true, name: true, email: true } }
            },
            orderBy: { createdAt: 'desc' } // Naye events sabse upar dikhenge
        });

        res.json(activities);
    } catch (error) {
        console.error('Get Activities Error:', error);
        res.status(500).json({ error: 'Failed to fetch activity logs' });
    }
};