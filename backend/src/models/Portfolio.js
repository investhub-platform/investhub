// models/Portfolio.js
import mongoose, { Schema } from "mongoose";
import { BaseSchema } from "./BaseSchema.js";

const InvestmentSchema = new Schema(
  {
    startupId: {
      type: Schema.Types.ObjectId,
      ref: "Startup",
      required: true
    },
    amountInvested: {
      type: Number,
      required: true,
      min: 0
    },
    investedAt: {
      type: Date,
      default: () => new Date()
    },
    shares: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const PortfolioSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: null
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    investments: [InvestmentSchema],
    totalValue: {
      type: Number,
      default: 0
    }
  },
  { versionKey: false }
);

PortfolioSchema.add(BaseSchema);

export default mongoose.model("Portfolio", PortfolioSchema);
