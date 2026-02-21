import { Schema, model } from "mongoose";
import { IConversation } from "../../types/conversation.types";

const conversationSchema = new Schema<IConversation>(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, default: "New Chat", trim: true },
    aiModel: { type: String, default: "gpt-4o" },
    systemPrompt: { type: String, default: null },
    taskType: { type: String, default: null },
    isDeleted: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    lastMessageAt: { type: Date, default: null },
    assignees: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  },
  { timestamps: true, versionKey: false },
);

conversationSchema.index({
  createdBy: 1,
  lastMessageAt: -1,
});

export const Conversation = model<IConversation>(
  "Conversation",
  conversationSchema,
  "conversations",
);
