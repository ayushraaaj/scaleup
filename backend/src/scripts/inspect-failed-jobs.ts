// npx tsx src/scripts/inspect-failed-jobs.ts

import { emailQueue } from "../queues/email.queue";

const retryFailedJobs = async () => {
  const failedJobs = await emailQueue.getFailed();

  for (const job of failedJobs) {
    console.log({
      id: job.id,
      name: job.name,
      attemptsMade: job.attemptsMade,
      failedReason: job.failedReason,
    });
  }

  const job = failedJobs.find(
    (job) => job.id === "outbox-6aa53e27779ef35d19bead72",
  );

  if (!job) {
    console.log("Job not found");
    await emailQueue.close();
    return;
  }

  console.log("Retrying job: ", {
    id: job.id,
    name: job.name,
    attemptsMade: job.attemptsMade,
    failedJobs: job.failedReason,
  });

  await job.retry();

  console.log("Job retry requested");

  await emailQueue.close();
};

retryFailedJobs();
