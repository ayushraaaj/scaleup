import { Document } from "mongoose";

export interface IUser extends Document {
    fullname: string;
    username: string;
    email: string;
    password: string;
    notificationsAllowed: boolean;
    isEmailVerified: boolean;

    emailVerificationToken?: string;
    emailVerificationExpiry?: Date;
    forgotPasswordToken?: string;
    forgotPasswordExpiry?: Date;
    refreshToken?: string;

    isPasswordValid(password: string): Promise<boolean>;

    generateAccessToken(): string;
    generateRefreshToken(): string;
}
