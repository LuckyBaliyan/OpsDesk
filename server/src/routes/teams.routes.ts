import { Router } from "express";
import { requireAuth, requireTeamRole } from "../middlewares/auth.middleware.js";
import { createTeam, addTeamMember, updateTeamMemberRole, getUserTeams, getTeamMembers, getAllTeams, getPinnedTeams, togglePinTeam } from "../controllers/teams.controller.js";
import { idempotencyMiddleware } from "../middlewares/idempotency.middleware.js";

const teamRouter = Router();

//1. CREATE A NEW TEAM
teamRouter.post('/teams', requireAuth, idempotencyMiddleware, createTeam);

//2. ADD A TEAM MEMBER IN TEAM -- BY ADMIN OR LEAD 
teamRouter.post('/teams/:teamId/members', requireAuth, requireTeamRole(['Admin', 'Lead']), idempotencyMiddleware, addTeamMember);


//3. UPDATE THE ROLE OF AN EXSISTING TEAM MEMBER
teamRouter.patch('/teams/:teamId/members/:memberId', requireAuth, requireTeamRole(['Admin']), idempotencyMiddleware, updateTeamMemberRole);

//4.Get current User teams
teamRouter.get('/user/teams',requireAuth, getUserTeams);

//5.Get all team Members
teamRouter.get('/teams/:teamId/members', requireAuth, getTeamMembers);

//6. Get all Teams
teamRouter.get('/teams', requireAuth, getAllTeams);

//7. Get all Pinned Teams for user
teamRouter.get('/teams/pinned', requireAuth, getPinnedTeams);

//8. Toggle Pin status of a team
teamRouter.post('/teams/:teamId/pin', requireAuth, togglePinTeam);

export default teamRouter;