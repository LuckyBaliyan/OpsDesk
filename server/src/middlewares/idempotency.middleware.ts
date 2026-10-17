import type { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import type { AuthenticatedRequest } from './auth.middleware.js';

const prisma = new PrismaClient();

export const idempotencyMiddleware = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const idempotencyKey = req.headers['idempotency-key'] as string;

    // Agar client ne header nahi bheja, toh request ko normal aage badne dein
    if (!idempotencyKey) {
        return next();
    }

    try {
        // Check karein kya yeh key pehle se database mein exist karti hai
        const existingRecord = await prisma.idempotencyKey.findUnique({
            where: { key: idempotencyKey }
        });

        if (existingRecord) {
            // Agar record mil gaya, iska matlab request pehle process ho chuki hai
            res.status(existingRecord.statusCode).json(JSON.parse(existingRecord.responseBody));
            return;
        }

        // Express ke `res.json` method ko override karenge taaki final response capture ho sake
        const originalJson = res.json.bind(res);
        res.json = (body: any) => {
            const statusCode = res.statusCode;

            // Response aane ke baad usko IdempotencyKey table mein save kar dein
            prisma.idempotencyKey.create({
                data: {
                    key: idempotencyKey,
                    statusCode: statusCode,
                    responseBody: JSON.stringify(body)
                }
            }).catch(err => console.error('Failed to save idempotency response:', err));

            return originalJson(body);
        };

        next();
    } catch (error) {
        console.error('Idempotency Middleware Error:', error);
        res.status(500).json({ error: 'Internal server error during idempotency check' });
    }
};