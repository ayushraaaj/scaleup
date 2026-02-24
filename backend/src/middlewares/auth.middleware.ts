import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../config/env";
import { User } from "../models/user.model";
import { Mentor } from "../models/mentor.model";

export const verifyJWT = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            throw new ApiError(401, "Unauthorized request");
        }

        const token = authHeader.split(" ")[1];

        try {
            const decodedToken = jwt.verify(
                token,
                ACCESS_TOKEN_SECRET,
            ) as JwtPayload;

            // const user = await User.findById(decodedToken._id);
            // if (!user) {
            //     throw new ApiError(401, "Invalid access token");
            // }

            req.user = decodedToken;
        } catch (error) {
            throw new ApiError(401, "Invalid access token");
        }

        next();
    },
);

export const checkIfMentor = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?._id;

        const mentor = await Mentor.findOne({ userId });

        if (!mentor) {
            throw new ApiError(403, "Forbidden");
        }

        req.mentor = mentor;

        next();
    },
);
