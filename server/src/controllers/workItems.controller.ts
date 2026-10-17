import { PrismaClient } from "@prisma/client";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import type { Response } from "express";
import { OutboxService } from "../services/outbox.service.js";

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

                  await OutboxService.createJob(tx, {
                        event: 'WORK_ITEM_CREATED',
                        workItemId: workItem.id,
                        title: workItem.title,
                        createdById: userId,
                        assigneeId: assigneeId || null
                  });

                  console.log("🔥 Outbox job successfully added to transaction!");

                  return workItem;
            });

            res.status(201).json(result);
      } catch (error) {
            res.status(500).json({ error: 'Failed to create work item' });
      }
}

export const getWorkByTeam = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
            const { teamId } = req.params;
            const { page = '1', limit = '10', status, priority, assigneeId, q } = req.query;

            if (typeof teamId !== 'string') {
                  res.status(400).json({ error: 'Invalid teamId' });
                  return;
            }

            const pageNumber = parseInt(page as string, 10);
            const pageSize = parseInt(limit as string, 10);
            const skip = (pageNumber - 1) * pageSize;

            // Dynamic where clause for filtering and search
            const whereClause: any = { teamId };

            if (status) whereClause.status = status;
            if (priority) whereClause.priority = priority;
            if (assigneeId) whereClause.assigneeId = assigneeId;

            if (q) {
                  whereClause.OR = [
                        { title: { contains: q as string, mode: 'insensitive' } },
                        { description: { contains: q as string, mode: 'insensitive' } }
                  ];
            }

            // Total count aur paginated items ek sath fetch karein
            const [items, totalCount] = await prisma.$transaction([
                  prisma.workItem.findMany({
                        where: whereClause,
                        include: { assignee: true, createdBy: true },
                        orderBy: { createdAt: 'desc' },
                        skip: skip,
                        take: pageSize
                  }),
                  prisma.workItem.count({ where: whereClause })
            ]);

            res.json({
                  data: items,
                  pagination: {
                        total: totalCount,
                        page: pageNumber,
                        limit: pageSize,
                        totalPages: Math.ceil(totalCount / pageSize)
                  }
            });
      } catch (error) {
            console.error('Fetch Work Items Error:', error);
            res.status(500).json({ error: 'Failed to fetch work items' });
      }
};

//3.Update the workItem via its id using optimistic locking
export const updateWork = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
            const { id } = req.params as { id: string } // type cast the param id;
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


// 4. Get a single work item with details and activity logs
export const getWorkItemById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
            const { id } = req.params as { id: string };
            const userId = req.user!.id;

            const workItem = await prisma.workItem.findUnique({
                  where: { id },
                  include: {
                        assignee: { select: { id: true, email: true } },
                        createdBy: { select: { id: true, email: true } },
                        activities: {
                              include: { actor: { select: { id: true, email: true } } },
                              orderBy: { createdAt: 'desc' }
                        }
                  }
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
                  res.status(403).json({ error: 'Forbidden: You do not have access to this work item' });
                  return;
            }

            res.json(workItem);
      } catch (error) {
            console.error('Get Work Item Error:', error);
            res.status(500).json({ error: 'Failed to fetch work item details' });
      }
};

// 5. Delete a work item (Restricted to Admin, Lead, or the creator)
export const deleteWorkItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
            const { id } = req.params as { id: string };
            const userId = req.user!.id;

            const workItem = await prisma.workItem.findUnique({
                  where: { id }
            });

            if (!workItem) {
                  res.status(404).json({ error: 'Work item not found' });
                  return;
            }

            // Check user membership and permissions
            const membership = await prisma.teamMembership.findUnique({
                  where: { userId_teamId: { userId, teamId: workItem.teamId } }
            });

            if (!membership || (!['Admin', 'Lead'].includes(membership.role) && workItem.createdById !== userId)) {
                  res.status(403).json({ error: 'Forbidden: Only Admins, Leads, or the creator can delete this work item' });
                  return;
            }

            // Transaction to delete activity logs and the work item atomically
            await prisma.$transaction(async (tx) => {
                  await tx.activityEvent.deleteMany({
                        where: { workItemId: id }
                  });

                  await tx.workItem.delete({
                        where: { id }
                  });
            });

            res.json({ message: 'Work item deleted successfully' });
      } catch (error) {
            console.error('Delete Work Item Error:', error);
            res.status(500).json({ error: 'Failed to delete work item' });
      }
};