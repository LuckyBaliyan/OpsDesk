import type { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

const prisma = new PrismaClient();

// 1. Create a new team and assign the creator as Admin
export const createTeam = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
            const { name, description } = req.body;
            const userId = req.user?.id;

            if (!name) {
                  res.status(400).json({ error: 'Bad Request: Team name is required' });
                  return;
            }

            // Prisma transaction to ensure atomicity
            const newTeam = await prisma.$transaction(async (tx) => {
                  const team = await tx.team.create({
                        data: {
                              name,
                              description,
                        },
                  });

                  // Make the creator an Admin of this team
                  await tx.teamMembership.create({
                        data: {
                              userId: userId!,
                              teamId: team.id,
                              role: 'Admin',
                        },
                  });

                  return team;
            });

            res.status(201).json({
                  message: 'Team created successfully',
                  team: newTeam,
            });
      } catch (error: any) {
            // Handle Prisma unique constraint error for duplicate team names
            if (error.code === 'P2002') {
                  res.status(400).json({ error: 'A team with this name already exists' });
                  return;
            }
            console.error('Create Team Error:', error);
            res.status(500).json({ error: 'Internal server error while creating team' });
      }
};


// 2. Add a member to a team (Only Admin or Lead can do this)
export const addTeamMember = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
            const teamId = req.params.teamId;
            const { email, role } = req.body; // role can be 'Lead', 'Member', 'Viewer'

            if (!teamId || typeof teamId !== 'string') {
                  res.status(400).json({ error: 'Bad Request: Valid teamId is required in URL params' });
                  return;
            }

            if (!email || !role) {
                  res.status(400).json({ error: 'Bad Request: Email and role are required' });
                  return;
            }

            // Validate role input
            const validRoles = ['Lead', 'Member', 'Viewer'];
            if (!validRoles.includes(role)) {
                  res.status(400).json({ error: 'Invalid role. Allowed roles: Lead, Member, Viewer' });
                  return;
            }

            // Find the user by email
            const userToAdd = await prisma.user.findUnique({
                  where: { email },
            });

            if (!userToAdd) {
                  res.status(404).json({ error: 'User not found with this email' });
                  return;
            }

            // Check if the user is already a member of this team
            const existingMembership = await prisma.teamMembership.findUnique({
                  where: {
                        userId_teamId: {
                              userId: userToAdd.id,
                              teamId,
                        },
                  },
            });

            if (existingMembership) {
                  res.status(400).json({ error: 'User is already a member of this team' });
                  return;
            }

            // Create the team membership
            const newMembership = await prisma.teamMembership.create({
                  data: {
                        userId: userToAdd.id,
                        teamId,
                        role,
                  },
                  include: {
                        user: {
                              select: {
                                    id: true,
                                    email: true,
                              },
                        },
                  },
            });

            res.status(201).json({
                  message: 'User added to the team successfully',
                  membership: newMembership,
            });
      } catch (error) {
            console.error('Add Team Member Error:', error);
            res.status(500).json({ error: 'Internal server error while adding team member' });
      }
};


// 3. Update a team member's role (Only Admin can do this)
export const updateTeamMemberRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
            const teamId = req.params.teamId as string;
            const memberId = req.params.memberId as string; // Yeh user ka ID hai jiska role change karna hai
            const { role } = req.body;

            const validRoles = ['Admin', 'Lead', 'Member', 'Viewer'];
            if (!role || !validRoles.includes(role)) {
                  res.status(400).json({ error: 'Invalid or missing role. Allowed roles: Admin, Lead, Member, Viewer' });
                  return;
            }

            // Check if the membership exists
            const membership = await prisma.teamMembership.findUnique({
                  where: {
                        userId_teamId: {
                              userId: memberId,
                              teamId,
                        },
                  },
            });

            if (!membership) {
                  res.status(404).json({ error: 'Membership not found for this user in the team' });
                  return;
            }

            // Update the role
            const updatedMembership = await prisma.teamMembership.update({
                  where: {
                        userId_teamId: {
                              userId: memberId,
                              teamId,
                        },
                  },
                  data: { role },
            });

            res.status(200).json({
                  message: 'Team member role updated successfully',
                  membership: updatedMembership,
            });
      } catch (error) {
            console.error('Update Member Role Error:', error);
            res.status(500).json({ error: 'Internal server error while updating member role' });
      }
};

//4. Get current user teams
export const getUserTeams = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
            const userId = req.user!.id;

            const memberships = await prisma.teamMembership.findMany({
                  where: { userId },
                  include: { team: true }
            });

            const teams = memberships.map(m => ({
                  ...m.team,
                  role: m.role // User ka us team mein kya role hai (Admin, Lead, Member, Viewer)
            }));

            res.json(teams);
      } catch (error) {
            console.error('Get User Teams Error:', error);
            res.status(500).json({ error: 'Failed to fetch teams' });
      }
};


//5.Get all members of a Team
export const getTeamMembers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
            const { teamId } = req.params as { teamId: string };
            const userId = req.user!.id;

            // Pehle check karo ki requesting user khud us team ka member hai ya nahi
            const membership = await prisma.teamMembership.findUnique({
                  where: { userId_teamId: { userId, teamId } }
            });

            if (!membership) {
                  res.status(403).json({ error: 'Forbidden: You do not have access to this team' });
                  return;
            }

            const members = await prisma.teamMembership.findMany({
                  where: { teamId },
                  include: {
                        user: { select: { id: true, name: true, email: true } }
                  }
            });

            res.json(members);
      } catch (error) {
            console.error('Get Team Members Error:', error);
            res.status(500).json({ error: 'Failed to fetch team members' });
      }
};


// GET /teams - Fetch all teams in the system
export const getAllTeams = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
            const { search } = req.query;
            const whereClause: any = {};

            if (search && (search as string).trim() !== '') {
                  whereClause.name = { contains: search as string, mode: 'insensitive' };
            }

            const teams = await prisma.team.findMany({
                  where: whereClause,
                  include: {
                        _count: {
                              select: {
                                    memberships: true,
                                    workItems: true
                              }
                        }
                  },
                  orderBy: { name: 'asc' }
            });

            res.json(teams);
      } catch (error) {
            console.error('Get All Teams Error:', error);
            res.status(500).json({ error: 'Failed to fetch teams' });
      }
};


// GET /teams/:id - Fetch single team details
export const getTeamById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
            const { id } = req.params as { id: string };
            const userId = req.user!.id;

            const team = await prisma.team.findUnique({
                  where: { id },
                  include: {
                        memberships: {
                              include: {
                                    user: { select: { id: true, name: true, email: true } }
                              }
                        },
                        _count: {
                              select: { workItems: true }
                        }
                  }
            });

            if (!team) {
                  res.status(404).json({ error: 'Team not found' });
                  return;
            }

            // Check current user's membership role in this team
            const userMembership = team.memberships.find(m => m.userId === userId);

            res.json({
                  ...team,
                  currentUserRole: userMembership ? userMembership.role : null
            });
      } catch (error) {
            console.error('Get Team By ID Error:', error);
            res.status(500).json({ error: 'Failed to fetch team details' });
      }
};
