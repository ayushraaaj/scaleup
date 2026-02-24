import express from "express";
import cors from "cors";
import { CLIENT_URL } from "./config/env";
import { errorHandler } from "./middlewares/error.middleware";
import cookieParser from "cookie-parser";

const app = express();

app.use(
    cors({
        origin: CLIENT_URL,
        credentials: true,
    }),
);

app.use(express.json());
app.use(cookieParser());

import healthCheckRouter from "./routers/healthcheck.router";
import authRouter from "./routers/auth.router";
import mentorRouter from "./routers/mentor.router";
import postRouter from "./routers/post.router";

app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/mentor", mentorRouter);
app.use("/api/v1/post", postRouter);

app.use(errorHandler);

export default app;
