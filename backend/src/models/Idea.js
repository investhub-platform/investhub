// models/Idea.js
import mongoose, { Schema } from "mongoose";

const IdeaSchema = new Schema(
  {
    StartupId: {
      type: Schema.Types.ObjectId,
      ref: "Startup",
      required: false
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    ImgURL: {
      type: String,
      default: null
    },

    category: {
      type: String,
      enum: ["Tech", "Health", "Education", "Finance", "Agriculture", "Other"],
      required: true
    },

    customCategory: {
      type: String,
      default: null
    },

    budget: {
      type: Number,
      required: true,
      min: 0
    },

    timeline: {
      type: String,
      default: null
    },

    expectedOutcomes: {
      type: String,
      default: null
    },

    currentVersion: {
      type: Number,
      default: 1
    },

    isIdea: {               
      type: Boolean,
      default: true    // true = idea, false = investment plan
    },

    status: {
      type: String,
      enum: ["pending_review", "approved", "rejected", "archived"],
      default: "pending_review"
    },

    aiSummary: {
      type: String,
      default: null
    },

    aiGeneratedAt: {
      type: Date,
      default: null
    },

    createdUtc: {
      type: Date,
      default: () => new Date()
    },

    updatedUtc: {
      type: Date,
      default: null
    },

    deletedUtc: {
      type: Date,
      default: null
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  { versionKey: false }
);

IdeaSchema.pre("validate", function () {

  // If it's an Idea → StartupId required
  if (this.isIdea && !this.StartupId) {
    throw new Error("StartupId is required when posting an Idea");
  }

  // If it's Investment Plan → StartupId must NOT exist
  if (!this.isIdea && this.StartupId) {
    throw new Error("Investment Plan should not have StartupId");
  }

  // Category validation
  if (this.category === "Other" && !this.customCategory) {
    throw new Error("Custom category is required when category is 'Other'");
  }
});

export default mongoose.model("Idea", IdeaSchema);