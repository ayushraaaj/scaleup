import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { generateAccessAndRefreshToken } from "../services/generateToken";

export const signupUser = asyncHandler(async (req: Request, res: Response) => {
    const { fullname, username, email, password } = req.body;

    const existingUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existingUser) {
        throw new ApiError(409, "User with username or email already exists");
    }

    const user = await User.create(req.body);

    const createdUser = await User.findById(user._id).select(
        "-password -emailVerificationToken -emailVerificationExpiry -forgotPasswordToken -forgotPasswordExpiry -refreshToken",
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user");
    }

    return res
        .status(201)
        .json(new ApiResponse("Signup successful", createdUser));
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { username_email, password } = req.body;

    const user = await User.findOne({
        $or: [{ email: username_email }, { username: username_email }],
    });

    if (!user) {
        throw new ApiError(401, "Invalid credentials");
    }

    const isPasswordCorrect = await user.isPasswordValid(password);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } =
        await generateAccessAndRefreshToken(user);

    const loggedInUser = await User.findById(user._id).select(
        "-password -emailVerificationToken -emailVerificationExpiry -forgotPasswordToken -forgotPasswordExpiry",
    );

    const options = {
        httpOnly: true,

        maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse("Login successful", {
                ...loggedInUser?.toObject(),
                accessToken,
            }),
        );
});

export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const user = await User.findByIdAndUpdate(userId, {
        $unset: { refreshToken: 1 },
    });

    const options = {
        httpOnly: true,
    };

    return res
        .status(200)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse("Logout successful", {}));
});

export const aboutMe = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const user = await User.findById(userId).select(
        "-password -emailVerificationToken -emailVerificationExpiry -forgotPasswordToken -forgotPasswordExpiry -refreshToken",
    );

    return res.status(200).json(new ApiResponse("User Authenticated", user));
});
