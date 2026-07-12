import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";

export const createReview = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    
  },
);
