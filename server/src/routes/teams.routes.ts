import { Router } from "express";
import { requireAuth, requireTeamRole } from "../middlewares/auth.middleware.js";
import { createTeam, addTeamMember, updateTeamMemberRole } from "../controllers/teams.controller.js";

const teamRouter = Router();

//1. CREATE A NEW TEAM
teamRouter.post('/teams', requireAuth, createTeam);

//2. ADD A TEAM MEMBER IN TEAM -- BY ADMIN OR LEAD 
teamRouter.post('/teams/:teamId/members', requireAuth, requireTeamRole(['Admin', 'Lead']), addTeamMember);


//3. UPDATE THE ROLE OF AN EXSISTING TEAM MEMBER
teamRouter.patch('/teams/:teamId/members/:memberId', requireAuth, requireTeamRole(['Admin']), updateTeamMemberRole);

export default teamRouter;