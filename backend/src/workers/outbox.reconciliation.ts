import { reconcileOutboxEvents } from "./outbox.worker";

const RECONCILIATION_INTERVAL = 60 * 1000;

const startReconciliationWorker = async () => {
  console.log("Outbox reconciliation worker started");

  while (true) {
    try {
      await reconcileOutboxEvents();
    } catch (error) {
      console.error("Outbox reconciliation failed: ", error);
    }

    await new Promise<void>((resolve) =>
      setTimeout(() => {
        resolve();
      }, RECONCILIATION_INTERVAL),
    );
  }
};

startReconciliationWorker();
