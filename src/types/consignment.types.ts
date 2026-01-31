import { ObjectId } from "mongoose";

export interface IConsignment {
  _id?: ObjectId;
  title: string;
  invoiceNumberRange: string[];
  brandName: string;
  portOfIssue: string;
  currency: string;
  isDeleted?: boolean;
  createdBy: ObjectId;
}

export interface IConsignmentFilter {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}
