import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const startOutboxWorker = () => {
      console.log('Outbox Worker started and listening for jobs...');

      // Har 5 seconds mein PENDING jobs check karega
      setInterval(async () => {
            try {
                  // 1. PENDING jobs fetch karein (batch of 10)
                  const pendingJobs = await prisma.outboxJob.findMany({
                        where: { status: 'PENDING' },
                        take: 10,
                        orderBy: { createdAt: 'asc' }
                  });

                  if (pendingJobs.length === 0) return;

                  for (const job of pendingJobs) {
                        try {
                              // 2. Job ko PROCESSING state mein update karein
                              await prisma.outboxJob.update({
                                    where: { id: job.id },
                                    data: {
                                          status: 'PROCESSING',
                                          attempts: { increment: 1 }
                                    }
                              });

                              const payload = JSON.parse(job.payload);
                              console.log(` Processing Outbox Event: [${payload.event}]`, payload);

                              // late i will call the actual service here like node mailer etc.
                              // i am just simulating the delay for 1 second:
                              await new Promise((resolve) => setTimeout(resolve, 1000));

                              // 3. Successfully process hone ke baad status COMPLETED kar dein
                              await prisma.outboxJob.update({
                                    where: { id: job.id },
                                    data: { status: 'COMPLETED' }
                              });

                              console.log(`Outbox Job Completed Successfully: ${job.id}`);
                        } catch (jobError) {
                              console.error(`Failed to process outbox job ${job.id}:`, jobError);

                              // Agar error aaye toh status FAILED mark kar dein
                              await prisma.outboxJob.update({
                                    where: { id: job.id },
                                    data: { status: 'FAILED' }
                              });
                        }
                  }
            } catch (error) {
                  console.error('Outbox Worker General Error:', error);
            }
      }, 5000); // 5000ms = Har 5 seconds mein run hoga

};