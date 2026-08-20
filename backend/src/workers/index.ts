import connectDB from "../db/db";

const startWorkers = async () => {
  await connectDB();

  await import("./email.worker.js");
  await import("./outbox.worker.js");
  await import("./outbox.reconciliation.js");
};

startWorkers();
