import { Router } from "express";
import { requireAuth, requireTeamRole } from "../middlewares/auth.middleware.js";
import { createWorkItem, getWorkByTeam, updateWork, getWorkItemById, deleteWorkItem } from "../controllers/workItems.controller.js";
import { idempotencyMiddleware } from "../middlewares/idempotency.middleware.js";

const workItemsRouter = Router();

//1. create work item
workItemsRouter.post('/work-items', requireAuth, requireTeamRole(['Member', 'Lead', 'Admin']), idempotencyMiddleware, createWorkItem);

// 2. Get Work Items for a Team
workItemsRouter.get('/teams/:teamId/work-items', requireAuth, requireTeamRole(['Viewer', 'Member', 'Lead', 'Admin']), getWorkByTeam);

//3. Update Work Item Status / Details with Optimistic Locking
workItemsRouter.patch('/work-items/:id', requireAuth, idempotencyMiddleware, updateWork);

//4.get a single work item by its id
workItemsRouter.get('/work-items/:id', requireAuth, getWorkItemById);

//5.delete a work item
workItemsRouter.delete('/work-items/:id', requireAuth, requireTeamRole(['Admin']), deleteWorkItem);

export default workItemsRouter;