import LiquidationHistory from "../models/LiquidationHistory.js";

export const getLiquidationHistories = async (req, res) => {
  try {
    const histories = await LiquidationHistory.find().sort({ startDate: -1 });

    res.status(200).json(histories);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch liquidation histories",
      error: error.message,
    });
  }
};

export const getLiquidationHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const history = await LiquidationHistory.findById(id);

    if (!history) {
      return res.status(404).json({
        message: "Liquidation history not found",
      });
    }

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch liquidation history",
      error: error.message,
    });
  }
};

export const createLiquidationHistory = async (req, res) => {
  try {
    const { label, startDate, endDate, totalAdded, totalPrice, startingGas } =
      req.body;

    const history = await LiquidationHistory.create({
      label,
      startDate,
      endDate,

      totalAdded,
      totalPrice,
      startingGas,
    });

    res.status(201).json(history);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create liquidation history",
      error: error.message,
    });
  }
};

export const updateLiquidationHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const history = await LiquidationHistory.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!history) {
      return res.status(404).json({
        message: "Liquidation history not found",
      });
    }

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update liquidation history",
      error: error.message,
    });
  }
};

export const deleteLiquidationHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const history = await LiquidationHistory.findByIdAndDelete(id);

    if (!history) {
      return res.status(404).json({
        message: "Liquidation history not found",
      });
    }

    res.status(200).json({
      message: "Liquidation history deleted successfully",
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete liquidation history",
      error: error.message,
    });
  }
};
