import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import liquidationHistoryRoutes from "./routes/liquidationHistoryRoutes.js";
import liquidationRoutes from "./routes/liquidationRoutes.js";
dotenv.config();

const app = express();

const allowedOrigins = [
  "https://gasoline-sys.onrender.com",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  }),
);
app.use(express.json());

connectDB();

// LIQUIDATION-HISTORY ROUTESm
app.use("/api/liquidation-history", liquidationHistoryRoutes);
// LIQUIDATION ROUTES
app.use("/api/liquidations", liquidationRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
