import { PrismaClient, type Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export asynsc class OutboxService {
    // Transaction ke andar outbox job add karne ke liye
    static async createJob(
        tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>,
        payload: object
    ) {
        return await tx.outboxJob.create({
            data: {
                payload: JSON.stringify(payload),
                status: 'PENDING',
                attempts: 0
            }
        });
    }
}