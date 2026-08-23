import mongoose from "mongoose";
import connectDB from "../db/db";
import { stopOutboxWorker } from "./outbox.worker";
import { closeRedis } from "../config/redis";
import { stopEmailWorker } from "./email.worker";

const startWorkers = async () => {
  await connectDB();

  await import("./email.worker.js");
  await import("./outbox.worker.js");
  await import("./outbox.reconciliation.js");
};

let isShuttingDown = false;

const shutdown = async (signal: string) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  console.log(`Shutdown signal received: ${signal}`);

  await stopEmailWorker();

  await stopOutboxWorker();

  await closeRedis();

  await mongoose.connection.close();

  console.log("Mongoose connection closed");

  process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

startWorkers();
