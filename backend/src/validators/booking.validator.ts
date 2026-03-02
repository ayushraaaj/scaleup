import { body, param } from "express-validator";
import { ApiError } from "../utils/ApiError";

export const createBookingValidator = () => {
    return [
        param("mentorId").isMongoId().withMessage("Invalid mentor ID"),

        body("sessionType")
            .isIn(["audio", "video"])
            .withMessage("Session type must be 'audio' or 'video'"),

        body("startTime").isISO8601().withMessage("Invalid start time"),

        body("durationInMinutes")
            .isInt({ min: 30 })
            .withMessage("Duration must be atleast 30 minutes")
            .custom((val) => {
                if (val % 30 !== 0) {
                    throw new ApiError(
                        400,
                        "Duration must be in 30 minute increments",
                    );
                }
                return true;
            }),
    ];
};
