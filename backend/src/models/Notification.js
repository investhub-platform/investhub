import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipientUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // optional for future relations
    startupId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },

    type: { type: String, required: true, index: true }, // e.g. "system_message"
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },

    relatedId: { type: mongoose.Schema.Types.ObjectId, default: null }, // ideaId/requestId/etc
    actionUrl: { type: String, default: null },

    isRead: { type: Boolean, default: false, index: true },

    createdUtc: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null }, // system/admin
    updatedUtc: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    deletedUtc: { type: Date, default: null, index: true },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    status: { type: String, default: "active", index: true },
  },
  { timestamps: false }
);

notificationSchema.index({ recipientUserId: 1, deletedUtc: 1, createdUtc: -1 });

export default mongoose.model("Notification", notificationSchema);
