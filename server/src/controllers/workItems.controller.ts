import { PrismaClient } from "@prisma/client";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import type { Response } from "express";
import { OutboxService } from "../services/outbox.service.js";

const prisma = new PrismaClient();

/**
 * Creates a new work item with role-based assignment restrictions.
 * Validates team membership and ensures that:
 * - Admin and Lead roles can assign the task to any team member or leave it unassigned.
 * - Normal Members can only assign the task to themselves or leave it unassigned.
 * Executes within a database transaction to create the work item, record an activity audit log,
 * and publish an outbox event.
 */
export const createWorkItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
            const { title, description, type, priority, teamId, assigneeId } = req.body;
            const userId = req.user!.id;

            if (!title || !type || !priority || !teamId) {
                  res.status(400).json({ error: 'Title, type, priority, and teamId are required' });
                  return;
            }

            // Verify requesting user's team membership and role
            const membership = await prisma.teamMembership.findUnique({
                  where: {
                        userId_teamId: { userId, teamId }
                  }
            });

            if (!membership || !['Member', 'Lead', 'Admin'].includes(membership.role)) {
                  res.status(403).json({ error: 'Forbidden: You do not have permission to create work items for this team' });
                  return;
            }

            const isAdminOrLead = ['Admin', 'Lead'].includes(membership.role);
            const cleanAssigneeId = assigneeId && assigneeId !== 'none' ? assigneeId : null;

            // Role enforcement: Normal members can only assign to themselves or leave unassigned
            if (!isAdminOrLead && cleanAssigneeId && cleanAssigneeId !== userId) {
                  res.status(403).json({
                        error: 'Forbidden: Normal members can only assign tasks to themselves or leave them unassigned until an Admin or Lead assigns it to others'
                  });
                  return;
            }

            const result = await prisma.$transaction(async (tx) => {
                  const workItem = await tx.workItem.create({
                        data: {
                              title,
                              description,
                              type,
                              priority,
                              teamId,
                              assigneeId: cleanAssigneeId,
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
                        assigneeId: cleanAssigneeId
                  });

                  return workItem;
            });

            res.status(201).json(result);
      } catch (error) {
            console.error('Create Work Item Error:', error);
            res.status(500).json({ error: 'Failed to create work item' });
      }
};

/**
 * Fetches paginated work items for a specific team with optional filters for status,
 * priority, assignee, and text search across title and description.
 */
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

/**
 * Updates a work item with optimistic concurrency control and strict role-based permissions:
 * - Admin or Lead can perform all modifications (title, description, status, priority, type,
 *   assigning to others, and approving/resolving/closing tasks).
 * - Normal Members:
 *   1. Cannot modify items that are already in 'AwaitingApproval', 'Resolved', or 'Closed' status.
 *   2. Have access only up to 'AwaitingApproval' (cannot set status to 'Resolved' or 'Closed').
 *   3. Cannot assign or reassign items to other users (can only self-assign or leave unassigned).
 *   4. Cannot modify tasks assigned to another member.
 *   5. Cannot change structural item type.
 * Increments item version and logs an audit activity event inside a database transaction.
 */
export const updateWork = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
            const { id } = req.params as { id: string };
            const { title, description, status, priority, type, assigneeId, version } = req.body;
            const userId = req.user!.id;

            // Fetch existing work item to obtain teamId, version, and current fields
            const existingItem = await prisma.workItem.findUnique({
                  where: { id }
            });

            if (!existingItem) {
                  res.status(404).json({ error: 'Work item not found' });
                  return;
            }

            // Verify user team membership and role
            const membership = await prisma.teamMembership.findUnique({
                  where: {
                        userId_teamId: { userId, teamId: existingItem.teamId }
                  }
            });

            if (!membership || !['Member', 'Lead', 'Admin'].includes(membership.role)) {
                  res.status(403).json({ error: 'Forbidden: You do not have permission to update this work item' });
                  return;
            }

            const isAdminOrLead = ['Admin', 'Lead'].includes(membership.role);

            // Clean sanitized assignee ID
            const cleanAssigneeId = assigneeId !== undefined
                  ? (assigneeId === 'none' || assigneeId === '' ? null : assigneeId)
                  : existingItem.assigneeId;

            // RBAC Enforcement for normal Members:
            if (!isAdminOrLead) {
                  // Rule 1: Normal members have access only till AwaitingApproval.
                  // If item is already AwaitingApproval, Resolved, or Closed, member cannot edit.
                  if (['AwaitingApproval', 'Resolved', 'Closed'].includes(existingItem.status)) {
                        res.status(403).json({
                              error: 'Forbidden: Normal members cannot modify work items that are awaiting approval, resolved, or closed. Only Admins or Leads can make modifications at this stage.'
                        });
                        return;
                  }

                  // Rule 2: Normal members cannot transition status to Resolved or Closed
                  if (status && ['Resolved', 'Closed'].includes(status)) {
                        res.status(403).json({
                              error: 'Forbidden: Normal members have access only till AwaitingApproval. Only Admins or Leads can resolve or close work items.'
                        });
                        return;
                  }

                  // Rule 3: Normal members cannot assign or reassign work items to other users
                  if (cleanAssigneeId !== null && cleanAssigneeId !== userId && cleanAssigneeId !== existingItem.assigneeId) {
                        res.status(403).json({
                              error: 'Forbidden: Only Admins or Leads can assign work items to other members. Normal members can only assign to themselves or leave unassigned.'
                        });
                        return;
                  }

                  // Rule 4: Normal members cannot modify work items assigned to another member
                  if (existingItem.assigneeId && existingItem.assigneeId !== userId) {
                        res.status(403).json({
                              error: 'Forbidden: Normal members can only modify unassigned tasks or tasks assigned to themselves.'
                        });
                        return;
                  }

                  // Rule 5: Normal members cannot modify structural work item type
                  if (type && type !== existingItem.type) {
                        res.status(403).json({
                              error: 'Forbidden: Only Admins or Leads can modify the work item type.'
                        });
                        return;
                  }
            }

            // Optimistic Locking check: conflict if client version does not match database version
            if (version !== undefined && existingItem.version !== version) {
                  res.status(409).json({
                        error: 'Conflict: The work item has been modified by another user. Please refresh and try again.',
                        currentVersion: existingItem.version
                  });
                  return;
            }

            // Transaction: update work item and append audit trail log
            const updatedItem = await prisma.$transaction(async (tx) => {
                  const item = await tx.workItem.update({
                        where: { id },
                        data: {
                              title: title ?? existingItem.title,
                              description: description ?? existingItem.description,
                              status: status ?? existingItem.status,
                              priority: priority ?? existingItem.priority,
                              type: type ?? existingItem.type,
                              assigneeId: cleanAssigneeId,
                              version: { increment: 1 }
                        }
                  });

                  // Build descriptive audit trail message capturing all changed fields
                  const changeList: string[] = [];

                  if (status && status !== existingItem.status) {
                        const formattedStatus = status === 'InProgress' ? 'In Progress' : status === 'AwaitingApproval' ? 'Awaiting Approval' : status;
                        changeList.push(`Status changed to ${formattedStatus}`);
                  }

                  if (priority && priority !== existingItem.priority) {
                        changeList.push(`Priority changed to ${priority}`);
                  }

                  if (assigneeId !== undefined && cleanAssigneeId !== existingItem.assigneeId) {
                        if (cleanAssigneeId) {
                              if (cleanAssigneeId === userId) {
                                    changeList.push('Assigned to self');
                              } else {
                                    const assignedUser = await tx.user.findUnique({
                                          where: { id: cleanAssigneeId },
                                          select: { name: true }
                                    });
                                    changeList.push(`Assigned to ${assignedUser?.name || 'team member'}`);
                              }
                        } else {
                              changeList.push('Unassigned');
                        }
                  }

                  if (title && title !== existingItem.title) {
                        changeList.push('Title updated');
                  }

                  if (description !== undefined && description !== existingItem.description) {
                        changeList.push('Description updated');
                  }

                  const changeDescription = changeList.length > 0 ? changeList.join(' · ') : 'Work item updated';

                  await tx.activityEvent.create({
                        data: {
                              workItemId: item.id,
                              actorId: userId,
                              actionType: 'UPDATED',
                              newValue: changeDescription
                        }
                  });

                  return item;
            });

            res.json(updatedItem);
      } catch (error) {
            console.error('Update Work Item Error:', error);
            res.status(500).json({ error: 'Failed to update work item' });
      }
};

/**
 * Fetches a single work item by its ID with relations for assignee, creator,
 * and activity history. Ensures the requesting user belongs to the associated team.
 */
export const getWorkItemById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
            const { id } = req.params as { id: string };
            const userId = req.user!.id;

            const workItem = await prisma.workItem.findUnique({
                  where: { id },
                  include: {
                        team: { select: { id: true, name: true } },
                        assignee: { select: { id: true, name: true, email: true } },
                        createdBy: { select: { id: true, name: true, email: true } },
                        activities: {
                              include: { actor: { select: { id: true, name: true, email: true } } },
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

/**
 * Deletes a work item and all associated activity events within an atomic transaction.
 * Restricted to Admins and Leads of the team.
 */
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

            // Check user membership and permissions (Admin or Lead required)
            const membership = await prisma.teamMembership.findUnique({
                  where: { userId_teamId: { userId, teamId: workItem.teamId } }
            });

            if (!membership || !['Admin', 'Lead'].includes(membership.role)) {
                  res.status(403).json({ error: 'Forbidden: Only Admins and Leads can delete work items' });
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

/**
 * Fetches all work items across all teams with assignee and creator details.
 * Used for high-level dashboard metrics and summaries.
 */
export const getAllWorkItems = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
            const items = await prisma.workItem.findMany({
                  include: { assignee: true, createdBy: true },
                  orderBy: { createdAt: 'desc' }
            });
            res.json({ success: true, data: items });
      } catch (error) {
            console.error('Get All Work Items Error:', error);
            res.status(500).json({ error: 'Failed to fetch all work items' });
      }
};