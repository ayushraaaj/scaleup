import dotenv from "dotenv";
import app from "./app";
import { PORT } from "./config/env";

dotenv.config({ path: "./.env" });

app.listen(PORT, () => {
    console.log(`Server is running on Port: ${PORT}`);
});
