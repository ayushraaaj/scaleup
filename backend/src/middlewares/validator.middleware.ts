import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError";

export const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        return next();
    }

    const message = errors.array()[0]?.msg || "Invalid request data";
    console.log(errors.array());

    throw new ApiError(422, message);
};
