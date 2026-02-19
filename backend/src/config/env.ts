import dotenv from "dotenv";

dotenv.config();

const getEnv = (key: string) => {
    const value = process.env[key];

    if (!value) {
        throw new Error(`Environment variable ${key} is missing`);
    }

    return value;
};

export const PORT = getEnv("PORT");

export const CLIENT_URL = getEnv("CLIENT_URL");
