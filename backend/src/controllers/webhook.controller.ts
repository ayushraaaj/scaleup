import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { EmailWebHookEvent } from "../models/emailWebhookEvent.model";
import { ApiResponse } from "../utils/ApiResponse";
import { webhookEvents } from "../constants/emailWebhookEvents";

export const handleEmailWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    const { id, event, "message-id": providerMessageId } = req.body;

    console.log("Webhook Received: ", req.body);

    const isProcessableEvent = webhookEvents.includes(event);

    try {
      const webhookEvent = await EmailWebHookEvent.create({
        webhookId: id,
        providerMessageId,
        event,
        payload: req.body,
        receivedAt: new Date(),
        ...(isProcessableEvent && {
          processingStatus: "pending",
        }),
      });

      console.log("Webhook Event Created:", webhookEvent._id);
    } catch (error) {
      console.error("Webhook Event Creation Failed:", error);

      throw error;
    }

    return res.status(200).json(new ApiResponse("Webhook received", {}));
  },
);
