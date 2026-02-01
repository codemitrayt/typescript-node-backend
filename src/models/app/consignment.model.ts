import { Model, model, Schema } from "mongoose";

import { CustomModel } from "../../types/shared.types";
import { IConsignment } from "../../types/consignment.types";

const consignmentSchema = new Schema<CustomModel<IConsignment>>(
  {
    title: { type: String, require: [true, "Title is required"] },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      require: [true, "Creator ID is required"],
    },
    invoiceNumberRange: {
      type: [String],
      required: [true, "Invoice range is required"],
    },
    brandName: { type: String, required: [true, "Brand name is required"] },
    currency: { type: String, required: [true, "Currency is required"] },
    portOfIssue: { type: String, required: [true, "Currency is required"] },
    isDeleted: { type: Boolean, default: false },
  },

  { timestamps: true, versionKey: false },
);

export const ConsignmentModel: Model<CustomModel<IConsignment>> = model<
  CustomModel<IConsignment>
>("Consignment", consignmentSchema, "consignments");
