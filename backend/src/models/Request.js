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
    // Deal Participants
    investorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    founderId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // The Deal Assets
    ideaId: { type: Schema.Types.ObjectId, ref: "Idea", required: true },
    mandateId: { type: Schema.Types.ObjectId, ref: "Idea", default: null },

    // Flow Control
    direction: {
      type: String,
      enum: ["investor_to_startup", "startup_to_investor"],
      required: true
    },

    SendId: { type: String, default: null },
    UserId: { type: String, default: null },
    StartupsId: { type: String, default: null },

    // Deal Terms
    amount: { type: Number, required: true, min: 0 },
    fundingType: {
      type: String,
      enum: ["Equity", "Revenue Share", "SAFE"],
      required: true
    },
    proposedPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    acceptedTerms: {
      type: Boolean,
      required: true,
      validate: {
        validator: (value) => value === true,
        message: "acceptedTerms must be accepted"
      }
    },
    message: { type: String, default: null },
    requestStatus: {
      type: String,
      enum: [
        "pending_founder",
        "pending_investor",
        "pending_mentor",
        "approved",
        "paid",
        "rejected",
        "withdrawn"
      ],
      required: true
    },

    // The Approvals
    founderDecision: { type: DecisionSchema, default: () => ({}) },
    investorDecision: { type: DecisionSchema, default: () => ({}) },
    mentorDecision: { type: DecisionSchema, default: () => ({}) },
    finalApprovedAmount: { type: Number, default: null, min: 0 }
  },
  { versionKey: false }
);

// add base fields (createdUtc, createdBy, updatedUtc, updatedBy, deletedUtc, deletedBy, status)
RequestSchema.add(BaseSchema);

export default mongoose.model("Request", RequestSchema);
