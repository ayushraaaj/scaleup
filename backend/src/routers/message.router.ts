import { Router } from "express";
import { createMessage, showMessages } from "../controllers/message.controller";
import { verifyJWT } from "../middlewares/auth.middleware";
import {
  createMessageValidator,
  showMessagesValidator,
} from "../validators/message.validator";
import { validate } from "../middlewares/validator.middleware";

const router = Router();

router.use(verifyJWT);

router
  .route("/create/:bookingId")
  .post(createMessageValidator(), validate, createMessage);

router
  .route("/show/:bookingId")
  .get(showMessagesValidator(), validate, showMessages);

export default router;
