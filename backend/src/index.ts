import express, { Request, Response } from "express";

const app = express();

app.get("/", (req: Request, res: Response) => {
    return res.status(200).json({ message: "Server is running fine" });
});

app.listen(8000, () => {
    console.log(`Server is running on Port: ${8000}`);
});
