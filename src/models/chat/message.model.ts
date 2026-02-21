import { Schema, model } from "mongoose";
import {
  IMessage,
  MessageRole,
  MessageStatus,
} from "../../types/message.types";

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    role: { type: String, enum: Object.values(MessageRole), required: true },
    content: { type: String, required: true },
    parentMessageId: { type: Schema.Types.ObjectId, default: null },
    tokenCount: { type: Number, default: 0 },
    cost: { type: Number, default: 0 },
    aiModel: { type: String, default: null },
    generatedIds: { type: [String], default: [] },
    status: {
      type: String,
      enum: Object.values(MessageStatus),
      default: MessageStatus.PENDING,
    },
    metadata: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true, versionKey: false },
);

messageSchema.index({
  conversationId: 1,
  createdAt: 1,
});

export const Message = model<IMessage>("Message", messageSchema, "messages");
