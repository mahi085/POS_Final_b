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

// ✅ FIXED CORS
const allowedOrigins = [
  "http://localhost:5173",
  "https://pos-final-f-7nmd.onrender.com" // ✅ NO trailing slash
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("❌ Not allowed by CORS: " + origin));
      }
    },
    credentials: true,
  })
);

// ✅ Handle preflight
app.options("*", cors());

app.use(express.json());

connectDB();

// routes
app.use("/api/product", productRoutes);
app.use("/api/sale", salesRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
  res.send("POS Server Running");
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
