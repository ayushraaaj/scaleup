import { addEmailJob } from "../queues/email.queue";
import { sendBookingConfirmationEmail } from "../services/email.service";

const test = async () => {
  await addEmailJob();

  console.log("Test email job added");
};

test();
