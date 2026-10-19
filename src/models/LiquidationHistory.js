import mongoose from "mongoose";

const liquidationHistorySchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    startingGas: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAdded: {
      type: Number,
      default: 0,
    },

    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: {
      createdAt: "createdDate",
      updatedAt: "updateDate",
    },
  },
);

const LiquidationHistory = mongoose.model(
  "LiquidationHistory",
  liquidationHistorySchema,
);

export default LiquidationHistory;
