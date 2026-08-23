import { startSessionSubscriber } from "./session.subscriber";

export const startSubscribers = async () => {
  await startSessionSubscriber();
};
