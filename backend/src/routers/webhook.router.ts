import { Router } from "express";
import { handleEmailWebhook } from "../controllers/webhook.controller";

const router = Router();

router.route("/email").post(handleEmailWebhook);

export default router;
