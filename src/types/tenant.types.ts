import { Document, Types } from "mongoose";

export interface ITenantFilter {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  search?: string;
}

export interface ITenant extends Document {
  createdBy: Types.ObjectId;
  name: string;
  websiteUrl: string;
  email: string;
  domain: string;
  users: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
