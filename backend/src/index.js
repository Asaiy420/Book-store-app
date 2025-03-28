import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import { connectDB } from "../src/lib/db.js";
import bookRoutes from "./routes/bookRoutes.js";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${process.env.PORT}`);
  connectDB();
});
