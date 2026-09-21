import { reconcileEmailWebhookEvents } from "./emailWebhook.worker";

const RECONCILIATION_INTERVAL = 60 * 1000;

const startReconciliationEmailWebhookWorker = async () => {
  console.log("Email webhook reconciliation worker started");

  while (true) {
    try {
      await reconcileEmailWebhookEvents();
    } catch (error) {
      console.error("Email webhook reconciliation failed: ", error);
    }

    await new Promise<void>((resolve) =>
      setTimeout(() => {
        resolve();
      }, RECONCILIATION_INTERVAL),
    );
  }
};

startReconciliationEmailWebhookWorker();
