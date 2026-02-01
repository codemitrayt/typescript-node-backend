import { ObjectId } from "mongoose";

export interface IDocumentFile {
  fileName: string;
  originalName: string;
  contentType: string;
  size: number;
  bucket: string;
  type: string;
}

export interface IDocument {
  _id: string;
  consignmentId: ObjectId;
  files: IDocumentFile[];
  status: string;
  isDeleted?: boolean;
  data?: object | null;
  createdBy: ObjectId;
}
