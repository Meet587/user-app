import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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
  },

  { timestamps: true }
);

// Method to hash passwords before saving
// UserSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// Method to compare passwords
// UserSchema.methods.comparePassword = async function (password: string) {
//   return await bcrypt.compare(password, this.password);
// };

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
