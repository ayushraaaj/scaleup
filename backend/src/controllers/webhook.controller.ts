import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { EmailWebHookEvent } from "../models/emailWebhookEvent.model";
import { ApiResponse } from "../utils/ApiResponse";

export const handleEmailWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    const { id, event, "message-id": providerMessageId, ts_event } = req.body;

    console.log("Webhook Received: ", req.body);

    await EmailWebHookEvent.create({
      webhookId: id,
      providerMessageId,
      event,
      payload: req.body,
      receivedAt: new Date(),
    });

    return res.status(200).json(new ApiResponse("Webhook received", {}));
  },
);
