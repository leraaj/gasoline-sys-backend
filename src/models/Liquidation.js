import mongoose from "mongoose";

const LiquidationSchema = new mongoose.Schema(
  {
    liquidationHistoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LiquidationHistory",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    previous: {
      type: Number,
      default: 0,
    },

    added: {
      type: Number,
      default: 0,
    },

    price: {
      type: Number,
      default: 0,
    },

    total: {
      type: Number,
      default: 0,
    },

    trip: {
      type: Number,
      default: 0,
    },

    remaining: {
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

const Liquidation = mongoose.model("Liquidation", LiquidationSchema);

export default Liquidation;
