import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { Post } from "../models/post.model";
import { ApiResponse } from "../utils/ApiResponse";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { Mentor } from "../models/mentor.model";
import { Reaction } from "../models/reaction.model";
import { Comment } from "../models/comment.model";

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

export const reactToPost = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { postId } = req.params;
    const { type } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const existingReaction = await Reaction.findOne({ postId, userId });

    // CASE 1: Reaction does not exists
    if (!existingReaction) {
        await Reaction.create({ postId, userId, type });

        if (type === "like") {
            await Post.findByIdAndUpdate(postId, {
                $inc: { likesCount: 1 },
            });
        }

        return res.status(200).json(new ApiResponse("Reaction added", {}));
    }

    // CASE 2: Clicked on the same reaction
    if (existingReaction.type === type) {
        await Reaction.findByIdAndDelete(existingReaction._id);

        if (type === "like") {
            await Post.findByIdAndUpdate(postId, {
                $inc: { likesCount: -1 },
            });
        }

        return res.status(200).json(new ApiResponse("Reaction removed", {}));
    }

    // CASE 3: Clicked on different reaction
    await Reaction.findByIdAndUpdate(existingReaction._id, { type });

    if (type === "like") {
        await Post.findByIdAndUpdate(postId, {
            $inc: { likesCount: 1 },
        });
    } else {
        await Post.findByIdAndUpdate(postId, {
            $inc: { likesCount: -1 },
        });
    }

    return res.status(200).json(new ApiResponse("Reaction updated", {}));
});

export const addComment = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { postId } = req.params;
    const { content } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    await Comment.create({ postId, userId, content });

    await Post.findByIdAndUpdate(postId, {
        $inc: { commentsCount: 1 },
    });

    return res.status(201).json(new ApiResponse("Comment added", {}));
});

export const getComments = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { postId } = req.params;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const post = await Post.findById(postId);

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const comments = await Comment.find({ postId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "fullname username");

    const totalComments = post.commentsCount;

    return res.status(200).json(
        new ApiResponse("Comments fetched", {
            page,
            totalPages: Math.ceil(totalComments / limit),
            totalComments,
            comments,
        }),
    );
});

export const deleteComment = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?._id;
        const { postId, commentId } = req.params;

        const post = await Post.findById(postId);
        if (!post) {
            throw new ApiError(404, "Post not found");
        }

        const comment = await Comment.findOne({
            _id: commentId,
            postId: postId,
        });
        if (!comment) {
            throw new ApiError(404, "Comment not found");
        }

        if (post.mentorId.equals(userId) || comment.userId.equals(userId)) {
            await Comment.findByIdAndDelete(commentId);

            await Post.findByIdAndUpdate(postId, {
                $inc: { commentsCount: -1 },
            });

            return res
                .status(200)
                .json(new ApiResponse("Comment deleted successfully", {}));
        }

        throw new ApiError(403, "Forbidden");
    },
);

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { postId } = req.params;

    const post = await Post.findOne({ _id: postId, mentorId: userId });

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    await Comment.deleteMany({ postId: post._id });

    await Reaction.deleteMany({ postId: post._id });

    await Post.findByIdAndDelete(postId);

    return res
        .status(200)
        .json(new ApiResponse("Post deleted successfully", {}));
});

export const editPost = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { postId } = req.params;
    const { title, content, tags, visibility } = req.body;

    const updateFields: PostUpdateFields = {};

    if (title) {
        updateFields.title = title;
    }
    if (content) {
        updateFields.content = content;
    }
    if (tags) {
        updateFields.tags = tags;
    }
    if (visibility) {
        updateFields.visibility = visibility;
    }

    if (Object.keys(updateFields).length === 0) {
        throw new ApiError(400, "No valid fields provided for update");
    }

    const updatedPost = await Post.findOneAndUpdate(
        { _id: postId, mentorId: userId },
        { $set: updateFields },
        { new: true },
    );

    if (!updatedPost) {
        throw new ApiError(404, "Post not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse("Post details updated successfully", updatedPost),
        );
});
