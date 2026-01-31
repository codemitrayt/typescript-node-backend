import { Model, model, Schema } from "mongoose";
import { AvailableUserRole } from "../../constant";
import { CustomModel } from "../../types/shared.types";
import { IUser, UserRole } from "../../types/user.types";

const userShecma = new Schema<CustomModel<IUser>>(
  {
    fullName: { type: String, require: [true, "Full name is required"] },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    role: { type: String, enum: AvailableUserRole, default: UserRole.USER },
    password: { type: String, default: null },
    avatar: { type: { url: String }, required: false },
    isVerified: { type: Boolean, default: false },
  },

  { timestamps: true, versionKey: false },
);

export const UserModel: Model<CustomModel<IUser>> = model<CustomModel<IUser>>(
  "User",
  userShecma,
  "users",
);
