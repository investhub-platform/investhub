import mongoose, { Schema } from "mongoose";
import { BaseSchema } from "./BaseSchema.js";

const DecisionSchema = new Schema(
  {
    decision: { type: String, enum: ["accept", "reject"], default: null },
    comment: { type: String, default: null },
    decidedAt: { type: Date, default: null }
  },
  { _id: false }
);

const RequestSchema = new Schema(
  {
    investorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ideaId: { type: Schema.Types.ObjectId, ref: "Idea" },
    SendId: { type: String, default: null },
    UserId: { type: String, default: null },
    StartupsId: { type: String, default: null },
    amount: { type: Number, required: true, min: 0 },
    message: { type: String, default: null },
    requestStatus: {
      type: String,
      enum: [
        "pending_founder",
        "pending_mentor",
        "approved",
        "rejected",
        "withdrawn"
      ],
      default: "pending_founder"
    },
    founderDecision: { type: DecisionSchema, default: () => ({}) },
    mentorDecision: { type: DecisionSchema, default: () => ({}) },
    finalApprovedAmount: { type: Number, default: null, min: 0 }
  },
  { versionKey: false }
);

// add base fields (createdUtc, createdBy, updatedUtc, updatedBy, deletedUtc, deletedBy, status)
RequestSchema.add(BaseSchema);

export default mongoose.model("Request", RequestSchema);
