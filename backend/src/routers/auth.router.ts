import { Router } from "express";
import {
    aboutMe,
    loginUser,
    logoutUser,
    signupUser,
} from "../controllers/auth.controller";
import { loginValidator, signupValidator } from "../validators/auth.validator";
import { validate } from "../middlewares/validator.middleware";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.route("/signup").post(signupValidator(), validate, signupUser);
router.route("/login").post(loginValidator(), validate, loginUser);

router.use(verifyJWT);

router.route("/logout").post(logoutUser);
router.route("/me").get(aboutMe);

export default router;
