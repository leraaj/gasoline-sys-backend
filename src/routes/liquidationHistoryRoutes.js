import express from "express";

import {
  getLiquidationHistories,
  getLiquidationHistory,
  createLiquidationHistory,
  updateLiquidationHistory,
  deleteLiquidationHistory,
} from "../controllers/liquidationHistoryController.js";

const router = express.Router();

router.get("/", getLiquidationHistories);

router.get("/:id", getLiquidationHistory);

router.post("/", createLiquidationHistory);

router.put("/:id", updateLiquidationHistory);

router.delete("/:id", deleteLiquidationHistory);

export default router;
