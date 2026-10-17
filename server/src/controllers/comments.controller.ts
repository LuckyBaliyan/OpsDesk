import type { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

const prisma = new PrismaClient();

// 1. Add a comment to a work item
export const addComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
            const { workItemId } = req.params as { workItemId: string };
            const { body } = req.body;
            const userId = req.user!.id;

            if (!body || body.trim() === '') {
                  res.status(400).json({ error: 'Comment body cannot be empty' });
                  return;
            }

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

            const comment = await prisma.comment.create({
                  data: {
                        workItemId,
                        authorId: userId,
                        body
                  },
                  include: {
                        author: { select: { id: true, name: true, email: true } }
                  }
            });

            res.status(201).json(comment);
      } catch (error) {
            console.error('Add Comment Error:', error);
            res.status(500).json({ error: 'Failed to add comment' });
      }
};

// 2. Get all comments for a work item with pagination
export const getCommentsByWorkItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
            const { workItemId } = req.params as { workItemId: string };
            const { page = '1', limit = '10' } = req.query;
            const userId = req.user!.id;

            const pageNumber = parseInt(page as string, 10);
            const pageSize = parseInt(limit as string, 10);
            const skip = (pageNumber - 1) * pageSize;

            const workItem = await prisma.workItem.findUnique({
                  where: { id: workItemId },
                  select: { teamId: true }
            });

            if (!workItem) {
                  res.status(404).json({ error: 'Work item not found' });
                  return;
            }

            const membership = await prisma.teamMembership.findUnique({
                  where: { userId_teamId: { userId, teamId: workItem.teamId } }
            });

            if (!membership) {
                  res.status(403).json({ error: 'Forbidden: You do not have access to this team' });
                  return;
            }

            // Transaction se comments list aur total count dono fetch karein
            const [comments, totalCount] = await prisma.$transaction([
                  prisma.comment.findMany({
                        where: { workItemId },
                        include: {
                              author: { select: { id: true, name: true, email: true } }
                        },
                        orderBy: { createdAt: 'asc' },
                        skip: skip,
                        take: pageSize
                  }),
                  prisma.comment.count({ where: { workItemId } })
            ]);

            res.json({
                  data: comments,
                  pagination: {
                        total: totalCount,
                        page: pageNumber,
                        limit: pageSize,
                        totalPages: Math.ceil(totalCount / pageSize)
                  }
            });
      } catch (error) {
            console.error('Get Comments Error:', error);
            res.status(500).json({ error: 'Failed to fetch comments' });
      }
};

// 3. Update a comment
export const updateComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
            const { id } = req.params as { id: string };
            const { body } = req.body;
            const userId = req.user!.id;

            if (!body || body.trim() === '') {
                  res.status(400).json({ error: 'Comment body cannot be empty' });
                  return;
            }

            const existingComment = await prisma.comment.findUnique({
                  where: { id },
            });

            if (!existingComment) {
                  res.status(404).json({ error: 'Comment not found' });
                  return;
            }

            // Sirf wahi user update kar sakega jisne comment likha hai
            if (existingComment.authorId !== userId) {
                  res.status(403).json({ error: 'Forbidden: You can only update your own comments' });
                  return;
            }

            const updatedComment = await prisma.comment.update({
                  where: { id },
                  data: { body },
                  include: { author: { select: { id: true, name: true, email: true } } }
            });

            res.json(updatedComment);
      } catch (error) {
            console.error('Update Comment Error:', error);
            res.status(500).json({ error: 'Failed to update comment' });
      }
};

// 4. Delete a comment
export const deleteComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
            const { id } = req.params as { id: string };
            const userId = req.user!.id;

            const existingComment = await prisma.comment.findUnique({
                  where: { id },
                  include: { workItem: { select: { teamId: true } } }
            });

            if (!existingComment) {
                  res.status(404).json({ error: 'Comment not found' });
                  return;
            }

            // Check if user is author or team Admin/Lead
            const membership = await prisma.teamMembership.findUnique({
                  where: { userId_teamId: { userId, teamId: existingComment.workItem.teamId } }
            });

            const isAdminOrLead = membership && ['Admin', 'Lead'].includes(membership.role);
            const isAuthor = existingComment.authorId === userId;

            if (!isAuthor && !isAdminOrLead) {
                  res.status(403).json({ error: 'Forbidden: You do not have permission to delete this comment' });
                  return;
            }

            await prisma.comment.delete({ where: { id } });

            res.json({ message: 'Comment deleted successfully' });
      } catch (error) {
            console.error('Delete Comment Error:', error);
            res.status(500).json({ error: 'Failed to delete comment' });
      }
}; 