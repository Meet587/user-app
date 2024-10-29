import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { UserRole } from "@/enum/userRole";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: false },
    email: { type: String, required: true },
    password: { type: String, required: false },
    isVerified: { type: Boolean, default: false },
    verifyToken: String,
    verifyTokenExpiry: Date,
    forgotPasswordToken: String,
    forgotPasswordTokenExpiry: Date,
    twoFactorSecret: { type: String },
    twoFactorEnabled: { type: Boolean, default: false },
    imageUrl: { type: String, default: "" },
    role: { type: String, enum: UserRole, default: UserRole.user },
  },

  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
