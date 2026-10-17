import { Router } from "express";
import { requireAuth, requireTeamRole } from "../middlewares/auth.middleware.js";
import { createTeam, addTeamMember, updateTeamMemberRole } from "../controllers/teams.controller.js";
import { idempotencyMiddleware } from "../middlewares/idempotency.middleware.js";

const teamRouter = Router();

//1. CREATE A NEW TEAM
teamRouter.post('/teams', requireAuth, idempotencyMiddleware, createTeam);

//2. ADD A TEAM MEMBER IN TEAM -- BY ADMIN OR LEAD 
teamRouter.post('/teams/:teamId/members', requireAuth, requireTeamRole(['Admin', 'Lead']), idempotencyMiddleware, addTeamMember);


//3. UPDATE THE ROLE OF AN EXSISTING TEAM MEMBER
teamRouter.patch('/teams/:teamId/members/:memberId', requireAuth, requireTeamRole(['Admin']), idempotencyMiddleware, updateTeamMemberRole);

export default teamRouter;