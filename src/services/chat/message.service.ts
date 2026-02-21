import { Model } from "mongoose";

import { IMessage } from "../../types/message.types";
import { Filter } from "../../types/shared.types";

export class MessageService {
  constructor(private model: Model<IMessage>) {}

  /* -------------------------------------------------------------------------- */
  /*                                   CREATE                                   */
  /* -------------------------------------------------------------------------- */

  async create(data: Partial<IMessage>) {
    return await this.model.create(data);
  }

  async bulkCreate(messages: Partial<IMessage>[]) {
    return await this.model.insertMany(messages);
  }

  /* -------------------------------------------------------------------------- */
  /*                                    READ                                    */
  /* -------------------------------------------------------------------------- */

  async getById(id: string) {
    return await this.model.findById(id).lean();
  }

  async getOne(filter: Filter) {
    return await this.model.findOne(filter).lean();
  }

  async getAll(filter: Filter = {}) {
    return await this.model.find(filter).lean();
  }

  /* -------------------------------------------------------------------------- */
  /*                      CURSOR-BASED PAGINATION (CHAT SAFE)                   */
  /* -------------------------------------------------------------------------- */

  async getListByConversation(params: {
    conversationId: string;
    limit?: number;
    cursorCreatedAt?: string;
    cursorId?: string;
  }): Promise<{
    data: IMessage[];
    nextCursor: string | null;
  }> {
    const { conversationId, limit = 20, cursorCreatedAt, cursorId } = params;

    const query: Filter = {
      conversationId,
    };

    // Cursor logic (stable pagination)
    if (cursorCreatedAt && cursorId) {
      query.$or = [
        {
          createdAt: {
            $lt: new Date(cursorCreatedAt),
          },
        },
        {
          createdAt: new Date(cursorCreatedAt),
          _id: { $lt: cursorId },
        },
      ];
    }

    const messages = await this.model
      .find(query)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit)
      .select({
        _id: 1,
        createdAt: 1,
        conversationId: 1,
        content: 1,
      })
      .lean();

    // Reverse to chronological order (oldest → newest)
    const ordered = messages.reverse();

    const nextCursor =
      ordered.length > 0
        ? `${ordered[0].createdAt.toISOString()}$${ordered[0]._id}`
        : null;

    return {
      data: ordered,
      nextCursor,
    };
  }
}
