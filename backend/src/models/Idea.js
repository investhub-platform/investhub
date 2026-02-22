// models/Idea.js
import mongoose, { Schema } from "mongoose";

const IdeaSchema = new Schema(
  {
    StartupId: {
      type: Schema.Types.ObjectId,
      ref: "Startup",
      required: true
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

    IsIdea: {
      type: Boolean,
      default: true
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

    //Base Fields Directly Added Here

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

//Validation for Other category
IdeaSchema.pre("validate", async function () {
  if (this.category === "Other" && !this.customCategory) {
    throw new Error("Custom category is required when category is 'Other'");
  }
});

export default mongoose.model("Idea", IdeaSchema);