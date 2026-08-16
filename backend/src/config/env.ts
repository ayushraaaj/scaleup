import dotenv from "dotenv";
import { SignOptions } from "jsonwebtoken";

dotenv.config();

type StringValue = NonNullable<SignOptions["expiresIn"]>;

const getEnv = (key: string) => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Environment variable ${key} is missing`);
  }

  return value;
};

export const PORT = getEnv("PORT");

export const MONGO_URI = getEnv("MONGO_URI");

export const NODE_ENV = getEnv("NODE_ENV");

export const ACCESS_TOKEN_SECRET = getEnv("ACCESS_TOKEN_SECRET");
export const ACCESS_TOKEN_EXPIRY = getEnv("ACCESS_TOKEN_EXPIRY") as StringValue;

export const REFRESH_TOKEN_SECRET = getEnv("REFRESH_TOKEN_SECRET");
export const REFRESH_TOKEN_EXPIRY = getEnv(
  "REFRESH_TOKEN_EXPIRY",
) as StringValue;

export const CLIENT_URL = getEnv("CLIENT_URL");

export const CLOUDINARY_CLOUD_NAME = getEnv("CLOUDINARY_CLOUD_NAME");
export const CLOUDINARY_API_KEY = getEnv("CLOUDINARY_API_KEY");
export const CLOUDINARY_API_SECRET = getEnv("CLOUDINARY_API_SECRET");

export const REDIS_URL = getEnv("REDIS_URL");

export const BREVO_API_KEY = getEnv("BREVO_API_KEY");
export const BREVO_SMTP_HOST = getEnv("BREVO_SMTP_HOST");
export const BREVO_SMTP_PASS = getEnv("BREVO_SMTP_PASS");
export const BREVO_SMTP_PORT = getEnv("BREVO_SMTP_PORT");
export const BREVO_SMTP_USER = getEnv("BREVO_SMTP_USER");

export const EMAIL_FROM = getEnv("EMAIL_FROM");
export const EMAIL_FROM_NAME = getEnv("EMAIL_FROM_NAME");
