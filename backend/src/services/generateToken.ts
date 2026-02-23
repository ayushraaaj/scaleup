import { IUser } from "../interfaces/IUser";
import { ApiError } from "../utils/ApiError";

export const generateAccessAndRefreshToken = async (user: IUser) => {
    try {
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: true });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while login");
    }
};
