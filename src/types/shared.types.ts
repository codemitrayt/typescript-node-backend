import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Document } from "mongoose";

export type CustomModel<T> = T & Document;

export interface CustomJwtPayload extends JwtPayload {
  user: { _id: string };
}

export interface CustomRequest<T = null> extends Request {
  body: T;
  user?: Express.User | undefined;
}

export type Filter = Record<string, unknown>;

// Add to your existing shared.types.ts file

export interface IFileMetadata {
  fileName: string;
  originalName: string;
  contentType: string;
  size: number;
  bucket: string;
}

export interface IMulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  destination?: string;
  filename?: string;
  path?: string;
}

export interface IBulkUploadResult {
  success: IFileMetadata[];
  failed: {
    originalName: string;
    error: string;
  }[];
  totalFiles: number;
  successCount: number;
  failedCount: number;
}

export interface IUploadResult {
  success: boolean;
  data?: IFileMetadata;
  error?: string;
  originalName: string;
}

export interface IBulkDeleteResult {
  success: string[];
  failed: {
    fileName: string;
    error: string;
  }[];
}

export interface IBulkSignedUrlResult {
  fileName: string;
  url: string;
  error?: string;
}
