import express from "express";
import cors from "cors";
import { CLIENT_URL } from "./config/env";

const app = express();

app.use(
    cors({
        origin: CLIENT_URL,
        credentials: true,
    }),
);

app.use(express.json());

import healthCheckRouter from "./routers/healthcheck.router";

app.use("/api/v1/healthcheck", healthCheckRouter);

export default app;
