export enum MessageRole {
  USER = "user",
  ASSISTANT = "assistant",
  SYSTEM = "system",
  TOOL = "tool",
}

export enum MessageStatus {
  PENDING = "Pending",
  STREAMING = "Streaming",
  COMPLETED = "Completed",
  ERROR = "Error",
}

export interface IMessageList {
  limit: number;
  conversationId: string;
  cursor?: string;
}
