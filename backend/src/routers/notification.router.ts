import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import {
  getAllNotifcations,
  readAllNotifications,
  unreadNotificationsCount,
} from "../controllers/notification.controller";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getAllNotifcations);

router.route("/read-all").patch(readAllNotifications);

router.route("/unread-count").get(unreadNotificationsCount);

export default router;
