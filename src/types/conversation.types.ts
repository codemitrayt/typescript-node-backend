import { Document, Types } from "mongoose";

export interface IConversationFilter {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  search?: string;
  createdBy?: string;
  isPinned?: boolean;
}

export interface IConversation extends Document {
  createdBy: Types.ObjectId;
  title: string;
  aiModel: string;
  systemPrompt?: string | null;
  taskType?: string | null;
  isDeleted: boolean;
  isPinned: boolean;
  lastMessageAt?: Date | null;
  assignees: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
