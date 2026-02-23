import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";

export const healthCheck = asyncHandler((req: Request, res: Response) => {
    return res
        .status(200)
        .json(new ApiResponse("OK", "Server is running fine"));
});
