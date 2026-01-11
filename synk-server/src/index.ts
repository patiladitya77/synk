import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRouter from "./routes/authRouter";
import boardRouter from "./routes/boardRouter";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/api/auth", authRouter);
app.use("/api/board", boardRouter);

const PORT = process.env.PORT || 7777;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
