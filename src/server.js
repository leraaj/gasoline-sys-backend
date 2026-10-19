import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import liquidationHistoryRoutes from "./routes/liquidationHistoryRoutes.js";
import liquidationRoutes from "./routes/liquidationRoutes.js";
dotenv.config();

const app = express();

app.use(
  cors({
    origin: "*",
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
