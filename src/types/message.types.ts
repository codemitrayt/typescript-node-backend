import { Document, Types } from "mongoose";

export enum MessageRole {
  USER = "user",
  ASSISTANT = "assistant",
  SYSTEM = "system",
}

export enum MessageStatus {
  PENDING = "Pending",
  COMPLETED = "Completed",
  FAILED = "Failed",
}

export interface IMessageList {
  conversationId: string;
  page: number;
  limit: number;
}

export interface IMessage extends Document {
  conversationId: Types.ObjectId;
  role: MessageRole;
  content: string;
  parentMessageId?: Types.ObjectId | null;
  tokenCount: number;
  cost: number;
  aiModel?: string | null;
  generatedIds: string[];
  status: MessageStatus;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}
