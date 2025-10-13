import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },

    verificationCode: { type: String },
    verificationCodeExpires: { type: Date },
    lastVerificationSent: { type: Date },

    failedLoginAttempts: { type: Number, default: 0 },
    lastFailedLogin: { type: Date },

    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

    // 🔑 Needed for refresh token auth
    refreshToken: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
