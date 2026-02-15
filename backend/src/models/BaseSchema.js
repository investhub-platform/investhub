// models/BaseSchema.js
import { Schema, Types } from "mongoose";

export const BaseSchema = new Schema(
  {
    createdUtc: { type: Date, default: () => new Date() },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedUtc: { type: Date, default: () => new Date() },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    deletedUtc: { type: Date, default: null },
    deletedBy: { type: Types.ObjectId, ref: "User", default: null },
    status: { type: String, default: "active" }
  },
  { _id: false } // don't want BaseSchema to create its own _id
);
