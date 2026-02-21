import { Schema, model } from "mongoose";
import { ITenant } from "../../types/tenant.types";

const tenantSchema = new Schema<ITenant>(
  {
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, unique: true, trim: true },
    websiteUrl: { type: String, required: true, unique: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    domain: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true, versionKey: false },
);

tenantSchema.index({ createdBy: 1, createdAt: -1 });

export const Tenant = model<ITenant>("Tenant", tenantSchema, "tenants");
