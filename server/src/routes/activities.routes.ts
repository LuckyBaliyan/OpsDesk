import { Router } from 'express';
import { getWorkItemActivities } from '../controllers/activities.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const activityRouter = Router();

// Get audit logs for a work item
activityRouter.get('/work-items/:workItemId/activities', requireAuth, getWorkItemActivities);

export default activityRouter;