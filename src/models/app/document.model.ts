import { Model, model, Schema } from "mongoose";

import { CustomModel } from "../../types/shared.types";
import { IDocument, IDocumentFile } from "../../types/document.types";

const filesSchema = new Schema<CustomModel<IDocumentFile>>({
  fileName: {
    type: String,
    required: [true, "File name is required"],
  },
  originalName: {
    type: String,
    required: [true, "Original file name is required"],
  },
  contentType: {
    type: String,
    required: [true, "Content type is required"],
  },
  size: {
    type: Number,
    default: 0,
  },
  bucket: {
    type: String,
    required: [true, "File stored bucket is required"],
  },
  type: {
    type: String,
    required: [true, "File type bucket is required"],
  },
});

const documentSchema = new Schema<CustomModel<IDocument>>(
  {
    consignmentId: {
      type: Schema.Types.ObjectId,
      ref: "Consignment",
      require: [true, "Consignment ID is required"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      require: [true, "Creator ID is required"],
    },
    files: {
      type: [filesSchema],
      required: [true, "Files is required"],
    },
    status: {
      type: String,
      default: "Pending",
    },
    data: { type: Object, default: null },
    isDeleted: { type: Boolean, default: false },
  },

  { timestamps: true, versionKey: false },
);

export const DocumentModel: Model<CustomModel<IDocument>> = model<
  CustomModel<IDocument>
>("Document", documentSchema, "documents");
