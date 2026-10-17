import { Router } from 'express';
import { addComment, getCommentsByWorkItem, updateComment, deleteComment } from '../controllers/comments.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { idempotencyMiddleware } from '../middlewares/idempotency.middleware.js';

const commentRouter = Router();

// 1. Add a comment to a specific work item
commentRouter.post('/work-items/:workItemId/comments', requireAuth, idempotencyMiddleware, addComment);

// 2. Get all comments for a specific work item
commentRouter.get('/work-items/:workItemId/comments', requireAuth, getCommentsByWorkItem);

//3. Update a comment
commentRouter.patch('/comments/:id', requireAuth, idempotencyMiddleware, updateComment);

// 4. Delete a comment
commentRouter.delete('/comments/:id', requireAuth, deleteComment);

export default commentRouter;