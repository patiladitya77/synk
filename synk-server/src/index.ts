import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/database";
import cors from "cors";
dotenv.config();
import cookieParser from "cookie-parser";
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
connectDB().then(() => {
  console.log("Connection Established");
  app.listen(process.env.PORT, () => {
    console.log("server running on port 7777");
  });
});
