import mongoose, { Schema } from "mongoose";

const ProgressReportSchema = new Schema({
  ideaId: { type: Schema.Types.ObjectId, ref: "Idea", required: true },
  mentorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  weekNumber: { type: Number, required: true },
  reportDate: { type: Date, default: () => new Date() },

  StartupId: { type: Schema.Types.ObjectId, ref: "Startup", required: true },
  tasksCompleted: { type: String, default: "" },
  challenges: { type: String, default: "" },
  nextGoals: { type: String, default: "" },
  overallStatus: {
    type: String,
    enum: ["on_track", "delayed", "at_risk"],
    default: "on_track"
  },
  milestones: [
    {
      name: { type: String, required: true, trim: true },
      status: {
        type: String,
        enum: ["not_started", "in_progress", "completed"],
        default: "not_started"
      },
      completionDate: { type: Date, default: null }
    }
  ],
//   attachments: [
//     {
//       name: { type: String, required: true },
//       url: { type: String, required: true }
//     }
//   ],

  createdUtc: { type: Date, default: () => new Date() },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  updatedUtc: { type: Date, default: () => new Date() },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  deletedUtc: { type: Date, default: null },
  deletedBy: { type: Schema.Types.ObjectId, default: null },
  status: { type: String, enum: ["active", "finished"], default: "active" }
}, { versionKey: false });

export default mongoose.model("ProgressReport", ProgressReportSchema);