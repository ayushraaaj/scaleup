import { body, param } from "express-validator";

export const createBookingValidator = () => {
    return [
        param("mentorId").isMongoId().withMessage("Invalid mentor ID"),

        body("sessionType")
            .isIn(["audio", "video"])
            .withMessage("Session type must be 'audio' or 'video'"),

        body("startTime")
            .notEmpty()
            .withMessage("Start time is required")
            .bail()
            .isISO8601()
            .withMessage("Invalid start time")
            .bail()
            .custom((startTime) => {
                const start = new Date(startTime);

                const minutes = start.getMinutes();
                if (minutes !== 0 && minutes !== 30) {
                    throw new Error(
                        "Start time must start at 00 or 30 minutes",
                    );
                }

                const now = new Date();
                if (start < now) {
                    throw new Error("Cannot book past time");
                }

                const maxBookingDate = new Date();
                maxBookingDate.setDate(maxBookingDate.getDate() + 30);

                if (start > maxBookingDate) {
                    throw new Error("Booking allowed only within 30 days");
                }

                return true;
            }),

        body("durationInMinutes")
            .notEmpty()
            .withMessage("Duration is required")
            .bail()
            .isInt({ min: 30 })
            .withMessage("Duration must be atleast 30 minutes")
            .bail()
            .custom((val) => {
                if (val % 30 !== 0) {
                    throw new Error("Duration must be in 30 minute increments");
                }
                return true;
            }),
    ];
};
