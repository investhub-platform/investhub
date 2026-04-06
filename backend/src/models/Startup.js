import mongoose, { Schema } from "mongoose";
import { BaseSchema } from "./BaseSchema.js";

const StartupSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: null },
    businessRegistration: { type: String, default: null, alias: "BR" },
    imgUrl: { type: String, default: null, alias: "ImgURL" },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, alias: "UserID" },
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

StartupSchema.index({ userId: 1 });
StartupSchema.index({ status: 1 });
StartupSchema.index({ createdUtc: -1 });

StartupSchema.set("toJSON", { virtuals: true });
StartupSchema.set("toObject", { virtuals: true });

export default mongoose.model("Startup", StartupSchema);
