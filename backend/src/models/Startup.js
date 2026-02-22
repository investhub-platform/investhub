import mongoose, { Schema } from "mongoose";
import { BaseSchema } from "./BaseSchema.js";

const StartupSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: null },
    BR: { type: String, default: null }, // Business Registration
    UserID: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["Approved", "NotApproved", "pending"],
      default: "pending"
    }
  },
  { versionKey: false }
);

// Note: status from BaseSchema will be overridden by the status field above
StartupSchema.add(BaseSchema);

export default mongoose.model("Startup", StartupSchema);
