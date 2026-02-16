import mongoose, { Schema } from "mongoose";
import { BaseSchema } from "./BaseSchema.js";

const StartupSchema = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: "" }
});
// add base fields
StartupSchema.add(BaseSchema);

export default mongoose.model("Startup", StartupSchema);
