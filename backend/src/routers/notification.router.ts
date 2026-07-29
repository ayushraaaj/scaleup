import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import {
  getAllNotifcations,
  readAllNotifications,
} from "../controllers/notification.controller";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getAllNotifcations);

router.route("/read-all").patch(readAllNotifications);

export default router;
