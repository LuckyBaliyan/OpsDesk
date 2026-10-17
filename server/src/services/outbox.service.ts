import { PrismaClient, type Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class OutboxService {
    // Transaction ke andar outbox job add karne ke liye
    static async createJob(
        //the below line tells that this method will gonna accept the prisma transaction client instead of the original prisma client
        tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>,
        payload: object //actual data we are goona keep in outbox table
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