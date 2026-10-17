import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import type { Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//get all of the users filter by name / email or else all
export const getUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
            const { search } = req.query;
            const whereClause: any = {};

            // Agar search query di hai, toh name ya email mein filter lagao
            if (search && (search as string).trim() !== '') {
                  whereClause.OR = [
                        { name: { contains: search as string, mode: 'insensitive' } },
                        { email: { contains: search as string, mode: 'insensitive' } }
                  ];
            }

            // Agar search khali hai, toh whereClause {} rahega aur saare users mil jayenge
            const users = await prisma.user.findMany({
                  where: whereClause,
                  select: { id: true, name: true, email: true },
                  orderBy: { name: 'asc' } // Alphabetical order mein saare users aa jayenge
            });

            res.json(users);
      } catch (error) {
            console.error('Get Users Error:', error);
            res.status(500).json({ error: 'Failed to fetch users' });
      }
};