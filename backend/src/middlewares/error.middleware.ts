import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { NODE_ENV } from "../config/env";
import { ApiError } from "../utils/ApiError";

export const errorHandler = (
    err: Error | ApiError,
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    let error;
    if (err instanceof ApiError) {
        error = err;
    } else {
        const statusCode = err instanceof mongoose.Error ? 400 : 500;

        const message = err.message || "Something went wrong";

        error = new ApiError(statusCode, message);
    }

    const response = {
        success: false,
        message: error.message,
        errors: error.errors,
        ...(NODE_ENV === "development" && { stack: error.stack }),
    };

    return res.status(error.statusCode).json(response);
};
