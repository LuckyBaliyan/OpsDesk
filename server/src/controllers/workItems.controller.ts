import { PrismaClient } from "@prisma/client";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import type { Response } from "express";

const prisma = new PrismaClient();

export const createWorkItem = async (req: AuthenticatedRequest, res: Response) => {
      try {
            const { title, description, type, priority, teamId, assigneeId } = req.body;
            const userId = req.user!.id;

            const result = await prisma.$transaction(async (tx) => {
                  const workItem = await tx.workItem.create({
                        data: {
                              title,
                              description,
                              type,
                              priority,
                              teamId,
                              assigneeId,
                              createdById: userId,
                              version: 1
                        }
                  });

                  await tx.activityEvent.create({
                        data: {
                              workItemId: workItem.id,
                              actorId: userId,
                              actionType: 'CREATED',
                              newValue: title
                        }
                  });

                  return workItem;
            });

            res.status(201).json(result);
      } catch (error) {
            res.status(500).json({ error: 'Failed to create work item' });
      }
}

export const getWorkByTeam = async (req: AuthenticatedRequest, res: Response) => {
      try {
            const { teamId } = req.params;
            if (typeof teamId !== 'string') {
                  res.status(400).json({ error: 'Invalid teamId' });
                  return;
            }
            const items = await prisma.workItem.findMany({
                  where: { teamId },
                  include: { assignee: true, createdBy: true },
                  orderBy: { createdAt: 'desc' }
            });
            res.json(items);
      } catch (error) {
            res.status(500).json({ error: 'Failed to fetch work items' });
      }
}

export const updateWork = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
            const { id } = req.params as {id: string} // type cast the param id;
            const { title, description, status, priority, type, assigneeId, version } = req.body;
            const userId = req.user!.id;

            // Pehle existing work item fetch karein taaki teamId aur current version mil sake
            const existingItem = await prisma.workItem.findUnique({
                  where: { id }
            });

            if (!existingItem) {
                  res.status(404).json({ error: 'Work item not found' });
                  return;
            }

            // Optional: Team role check kar sakte hain ki user ko update karne ki permission hai ya nahi
            const membership = await prisma.teamMembership.findUnique({
                  where: {
                        userId_teamId: { userId, teamId: existingItem.teamId }
                  }
            });

            if (!membership || !['Member', 'Lead', 'Admin'].includes(membership.role)) {
                  res.status(403).json({ error: 'Forbidden: You do not have permission to update this work item' });
                  return;
            }

            // Optimistic Locking check: Agar client ka version database ke version se match nahi karta
            if (version !== undefined && existingItem.version !== version) {
                  res.status(409).json({ 
                        error: 'Conflict: The work item has been modified by another user. Please refresh and try again.',
                        currentVersion: existingItem.version 
                  });
                  return;
            }

            // Transaction ke sath update aur audit log entry
            const updatedItem = await prisma.$transaction(async (tx) => {
                  const item = await tx.workItem.update({
                        where: { id },
                        data: {
                              title: title ?? existingItem.title,
                              description: description ?? existingItem.description,
                              status: status ?? existingItem.status,
                              priority: priority ?? existingItem.priority,
                              type: type ?? existingItem.type,
                              assigneeId: assigneeId ?? existingItem.assigneeId,
                              version: { increment: 1 } // Version ko automatically 1 se badha dega
                        }
                  });

                  // Audit trail log for update
                  await tx.activityEvent.create({
                        data: {
                              workItemId: item.id,
                              actorId: userId,
                              actionType: 'UPDATED',
                              newValue: status ? `Status changed to ${status}` : 'Work item updated'
                        }
                  });

                  return item;
            });

            res.json(updatedItem);
      } catch (error) {
            res.status(500).json({ error: 'Failed to update work item' });
      }
}