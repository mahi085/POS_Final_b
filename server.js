import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import salesRoutes from "./routes/salesRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://pos-f-awga.onrender.com",
      "srv-d78h2vvfte5s7392q14g"
    ],
    credentials: true,
  })
);
app.use(express.json());

connectDB();

app.use("/api/product", productRoutes);
app.use("/api/sale", salesRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
  res.send("POS Server Running");
});
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Server running on port 3000");
});
