import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { BREVO_WEBHOOK_TOKEN } from "../config/env";
import crypto from "crypto";

export const verifyBrevoWebhook = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new ApiError(401, "Unauthorized request");
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const expectedToken = BREVO_WEBHOOK_TOKEN;

    if (!expectedToken) {
      throw new ApiError(500, "Webhook authentication is not configured");
    }

    const tokenBuffer = Buffer.from(token);
    const expectedTokenBuffer = Buffer.from(expectedToken);

    if (
      tokenBuffer.length !== expectedTokenBuffer.length ||
      !crypto.timingSafeEqual(tokenBuffer, expectedTokenBuffer)
    ) {
      throw new ApiError(401, "Unauthorized request");
    }

    next();
  },
);
