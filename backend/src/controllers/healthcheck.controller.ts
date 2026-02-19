import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";

export const healthCheck = asyncHandler((req: Request, res: Response) => {
    return res.status(200).json({ message: "Server is running fine" });
});
