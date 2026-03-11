import { Router } from "express";
import {
    aboutMe,
    loginUser,
    logoutUser,
    refreshToken,
    signupUser,
} from "../controllers/auth.controller";
import { loginValidator, signupValidator } from "../validators/auth.validator";
import { validate } from "../middlewares/validator.middleware";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.route("/signup").post(signupValidator(), validate, signupUser);
router.route("/login").post(loginValidator(), validate, loginUser);
router.route("/refresh-token").post(refreshToken);

router.use(verifyJWT);

router.route("/logout").post(logoutUser);
router.route("/me").get(aboutMe);

export default router;
