import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },

    passwordHash: { type: String, required: true },

    roles: { type: [String], default: ["user"] }, // ["user"] or ["admin"]

    status: {
      type: String,
      enum: ["pending_email_verification", "active", "suspended", "deleted"],
      default: "pending_email_verification",
      index: true,
    },

    profile: {
      phone: { type: String, default: null },
      bio: { type: String, default: null },
      location: { type: String, default: null },
      profilePictureUrl: { type: String, default: null },
      linkedin: { type: String, default: null },
      NIC: { type: String, default: null },
      Expertise: { type: String, default: null },
    },

    walletId: { type: mongoose.Schema.Types.ObjectId, default: null },

    preferences: {
      notificationEmail: { type: Boolean, default: true },
      notificationInApp: { type: Boolean, default: true },
    },

    // OTPs (store HASHES, not plain OTP)
    emailOtpHash: { type: String, default: null },
    emailOtpExpiryUtc: { type: Date, default: null },
    //resend otp
    emailOtpLastSentUtc: { type: Date, default: null },


    resetOtpHash: { type: String, default: null },
    resetOtpExpiryUtc: { type: Date, default: null },
    resetOtpLastSentUtc: { type: Date, default: null },


    // Refresh token (store HASH)
    refreshTokenHash: { type: String, default: null },

    createdUtc: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    updatedUtc: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    deletedUtc: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: false }
);

export default mongoose.model("User", userSchema);
