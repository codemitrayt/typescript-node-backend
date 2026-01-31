import { ObjectId } from "mongoose";

export interface IDocumentFile {
  fileName: string;
  originalName: string;
  contentType: string;
  size: number;
  bucket: string;
}

export interface IDocument {
  _id: string;
  consignmentId: ObjectId;
  files: IDocumentFile[];
  status: string;
  isDeleted?: boolean;
  data?: object | null;
}
