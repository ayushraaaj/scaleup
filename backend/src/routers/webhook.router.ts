import { Router } from "express";
import { handleEmailWebhook } from "../controllers/webhook.controller";
import { verifyBrevoWebhook } from "../middlewares/brevoWebhook.middleware";

const router = Router();

router.use(verifyBrevoWebhook);

router.route("/email").post(handleEmailWebhook);

export default router;
