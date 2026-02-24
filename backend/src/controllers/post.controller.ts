import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { Post } from "../models/post.model";
import { ApiResponse } from "../utils/ApiResponse";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { Mentor } from "../models/mentor.model";

export const createPost = asyncHandler(async (req: Request, res: Response) => {
    const mentorId = req.user?._id;

    const { title, content, tags, visibility } = req.body;

    const post = await Post.create({
        mentorId,
        title,
        content,
        tags,
        visibility,
    });

    return res
        .status(201)
        .json(new ApiResponse("Post created successfully", post));
});

export const getMentorPosts = asyncHandler(
    async (req: Request, res: Response) => {
        const { username } = req.params;

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const user = await User.findOne({ username });

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const mentor = await Mentor.findOne({ userId: user._id });

        if (!mentor) {
            throw new ApiError(404, "This user is not a mentor");
        }

        const posts = await Post.findOne({ mentorId: user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalPosts = await Post.countDocuments({ mentorId: user._id });

        return res.status(200).json(
            new ApiResponse(`${username} post fetched`, {
                page,
                totalPages: Math.ceil(totalPosts / limit),
                totalPosts,
                posts,
            }),
        );
    },
);

export const getSinglePost = asyncHandler(
    async (req: Request, res: Response) => {
        const { postId } = req.params;

        const post = await Post.findById(postId);

        if (!post) {
            throw new ApiError(404, "Post not found");
        }

        return res.status(200).json(new ApiResponse("Post fetched", post));
    },
);
