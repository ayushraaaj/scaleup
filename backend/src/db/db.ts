import mongoose from "mongoose";
import { MONGO_URI } from "../config/env";
import { ApiError } from "../utils/ApiError";

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB connected");
    } catch (error) {
        throw new ApiError(500, "Failed to connect to MongoDB");
    }
};

export default connectDB;
