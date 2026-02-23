import dotenv from "dotenv";
import app from "./app";
import { PORT } from "./config/env";
import connectDB from "./db/db";

dotenv.config({ path: "./.env" });

connectDB();

app.listen(PORT || 8001, () => {
    console.log(`Server is running on Port: ${PORT || 8001}`);
});
