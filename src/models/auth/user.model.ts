import { Schema, model } from "mongoose";
import { UserType, LoginType, UserRole } from "../../types/user.types";

const userSchema = new Schema<UserType>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      default: null,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    fullName: { type: String, required: true, trim: true },
    isVerified: { type: Boolean, default: false },
    avatar: { type: Schema.Types.Mixed, default: null },
    password: { type: String, default: null },
    loginType: { type: String, enum: Object.values(LoginType), default: null },
    lastActiveAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true, versionKey: false },
);

userSchema.index({ tenantId: 1, email: 1 }, { unique: true });

export const User = model<UserType>("User", userSchema, "users");
