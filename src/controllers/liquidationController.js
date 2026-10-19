import mongoose from "mongoose";
import Liquidation from "../models/Liquidation.js";
import LiquidationHistory from "../models/LiquidationHistory.js";

/**
 * Replace all liquidations for a history.
 * Validates the payload and uses a transaction
 * to prevent data loss if saving fails.
 */
export const saveMultipleLiquidations = async (req, res) => {
  const { liquidationHistoryId, entries } = req.body;

  // 1. Validate the parent ID
  if (
    !liquidationHistoryId ||
    !mongoose.isValidObjectId(liquidationHistoryId)
  ) {
    return res.status(400).json({
      success: false,
      message: "A valid liquidationHistoryId is required.",
    });
  }

  // 2. Validate the entries array
  if (!Array.isArray(entries)) {
    return res.status(400).json({
      success: false,
      message: "Entries must be an array.",
    });
  }

  // 3. Validate every entry BEFORE deleting anything
  const numericFields = [
    "previous",
    "added",
    "price",
    "total",
    "trip",
    "remaining",
  ];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];

    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      return res.status(400).json({
        success: false,
        message: `Entry at index ${i} must be an object.`,
      });
    }

    if (!entry.date || Number.isNaN(new Date(entry.date).getTime())) {
      return res.status(400).json({
        success: false,
        message: `Entry at index ${i} must have a valid date.`,
      });
    }

    for (const field of numericFields) {
      // Missing fields are allowed because the schema
      // provides defaults. Supplied values must be numbers.
      if (
        entry[field] !== undefined &&
        (typeof entry[field] !== "number" || !Number.isFinite(entry[field]))
      ) {
        return res.status(400).json({
          success: false,
          message: `Entry at index ${i} has an invalid ${field} value.`,
        });
      }
    }
  }

  // 4. Prepare entries with the parent ID
  const liquidationEntries = entries.map((entry) => ({
    ...entry,
    liquidationHistoryId,
  }));

  // 5. Start the transaction
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Verify the parent history exists
    const history =
      await LiquidationHistory.findById(liquidationHistoryId).session(session);

    if (!history) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Liquidation history not found.",
      });
    }

    // 6. Delete the previous entries within the transaction
    await Liquidation.deleteMany({ liquidationHistoryId }, { session });

    // 7. Insert the replacement entries, if any
    const liquidations = entries.length
      ? await Liquidation.insertMany(liquidationEntries, {
          session,
        })
      : [];

    // 8. Calculate the totals from the saved entries
    const totalAdded = liquidations.reduce(
      (sum, item) => sum + (Number(item.added) || 0),
      0,
    );

    const totalPrice = liquidations.reduce(
      (sum, item) => sum + (Number(item.price) || 0),
      0,
    );

    // 9. Update the parent history within the same transaction
    await LiquidationHistory.findByIdAndUpdate(
      liquidationHistoryId,
      {
        $set: {
          totalAdded,
          totalPrice,
        },
      },
      {
        new: true,
        runValidators: true,
        session,
      },
    );

    // 10. Commit only after all database operations succeed
    await session.commitTransaction();

    return res.status(entries.length ? 201 : 200).json({
      success: true,
      message: entries.length
        ? `${liquidations.length} liquidation entries saved successfully.`
        : "All liquidation entries deleted successfully.",
      count: liquidations.length,
      totalAdded,
      totalPrice,
      data: liquidations,
    });
  } catch (error) {
    // If anything fails, undo the deletion and insertion
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error("Failed to save multiple liquidations:", error);

    const isValidationError =
      error.name === "ValidationError" ||
      error.name === "CastError" ||
      error.code === 11000;

    return res.status(isValidationError ? 400 : 500).json({
      success: false,
      message: isValidationError
        ? error.message
        : "Failed to save liquidation entries. Existing entries were preserved if the transaction was rolled back.",
    });
  } finally {
    // Always release the session
    await session.endSession();
  }
};

// Get all Liquidations for a Liquidation History
export const getLiquidations = async (req, res) => {
  try {
    const { liquidationHistoryId } = req.params;

    // Make sure the parent history exists
    const history = await LiquidationHistory.findById(liquidationHistoryId);

    if (!history) {
      return res.status(404).json({
        success: false,
        message: "Liquidation history not found.",
      });
    }

    const liquidations = await Liquidation.find({
      liquidationHistoryId,
    }).sort({
      date: 1,
    });

    return res.status(200).json({
      success: true,
      count: liquidations.length,
      data: liquidations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single Liquidation
export const getLiquidationById = async (req, res) => {
  try {
    const liquidation = await Liquidation.findById(req.params.id);

    if (!liquidation) {
      return res.status(404).json({
        success: false,
        message: "Liquidation not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: liquidation,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Liquidation
export const updateLiquidation = async (req, res) => {
  try {
    const liquidation = await Liquidation.findById(req.params.id);

    if (!liquidation) {
      return res.status(404).json({
        success: false,
        message: "Liquidation not found.",
      });
    }

    const updatedLiquidation = await Liquidation.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Liquidation updated successfully.",
      data: updatedLiquidation,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Liquidation
export const deleteLiquidation = async (req, res) => {
  try {
    const liquidation = await Liquidation.findById(req.params.id);

    if (!liquidation) {
      return res.status(404).json({
        success: false,
        message: "Liquidation not found.",
      });
    }

    await liquidation.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Liquidation deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
