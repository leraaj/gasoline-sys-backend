import express from "express";

import {
  saveMultipleLiquidations,
  getLiquidations,
  getLiquidationById,
  updateLiquidation,
  deleteLiquidation,
} from "../controllers/liquidationController.js";

const router = express.Router();

// Save Multiple liquidations
router.post("/", saveMultipleLiquidations);

// Get all liquidations for a specific liquidation history
router.get("/history/:liquidationHistoryId", getLiquidations);

// Get a single liquidation
router.get("/:id", getLiquidationById);

// Update a liquidation
router.put("/:id", updateLiquidation);

// Delete a liquidation
router.delete("/:id", deleteLiquidation);

export default router;
