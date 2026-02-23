import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import { IUser } from "../interfaces/IUser";
import jwt from "jsonwebtoken";
import {
    ACCESS_TOKEN_EXPIRY,
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRY,
    REFRESH_TOKEN_SECRET,
} from "../config/env";

const userSchema = new mongoose.Schema<IUser>(
    {
        fullname: {
            type: String,
            required: [true, "Fullname is required"],
            trim: true,
        },
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: [true, "Username must be unique"],
            lowercase: true,
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: [true, "Email must be unique"],
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            trim: true,
        },
        notificationsAllowed: {
            type: Boolean,
            default: false,
        },
        isMentor: {
            type: Boolean,
            default: false,
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        emailVerificationToken: String,
        emailVerificationExpiry: Date,
        forgotPasswordToken: String,
        forgotPasswordExpiry: Date,
        refreshToken: String,
    },
    { timestamps: true },
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    this.password = await bcryptjs.hash(this.password, 10);
});

userSchema.methods.isPasswordValid = async function (password: string) {
    return await bcryptjs.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
        },
        ACCESS_TOKEN_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY },
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        REFRESH_TOKEN_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRY },
    );
};

export const User = mongoose.model("users", userSchema);
