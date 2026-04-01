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
      default: 0,
      min: 0
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
      default: null,
      trim: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    investments: {
      type: [InvestmentSchema],
      default: []
    },

    totalValue: {
      type: Number,
      default: 0,
      min: 0
    },
    totalInvested: {
      type: Number,
      default: 0,
      min: 0
    },
    totalReturns: {
      type: Number,
      default: 0,
      min: 0
    },
    profitLoss: {
      type: Number,
      default: 0
    },
    roiPercentage: {
      type: Number,
      default: 0
    },

    category: {
      type: String,
      enum: ["Startup", "Stocks", "Crypto", "Mixed"],
      default: "Startup"
    },
    riskLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium"
    },

    visibility: {
      type: String,
      enum: ["Private", "Public"],
      default: "Private"
    },
    status: {
      type: String,
      enum: ["Active", "Archived"],
      default: "Active"
    },

    isFavorite: {
      type: Boolean,
      default: false
    },

    lastUpdated: {
      type: Date,
      default: () => new Date()
    }
  },
  { versionKey: false }
);

PortfolioSchema.add(BaseSchema);

PortfolioSchema.pre("save", function (next) {
  this.totalInvested = this.investments.reduce(
    (sum, item) => sum + (item.amountInvested || 0),
    0
  );

  this.profitLoss = (this.totalReturns || 0) - (this.totalInvested || 0);

  this.roiPercentage =
    this.totalInvested > 0 ? (this.profitLoss / this.totalInvested) * 100 : 0;

  this.lastUpdated = new Date();

  next();
});

export default mongoose.model("Portfolio", PortfolioSchema);
