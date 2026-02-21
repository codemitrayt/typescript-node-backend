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

  async getListByConversation({
    conversationId,
    page,
    limit,
  }: {
    conversationId: string;
    page: number;
    limit: number;
  }) {
    const skip = (page - 1) * limit;

    const messages = await this.model
      .find({ conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalCount = await this.model.countDocuments({
      conversationId,
    });

    const hasMore = skip + messages.length < totalCount;

    return {
      messages,
      pagination: {
        page,
        limit,
        totalCount,
        hasMore,
        nextPage: hasMore ? page + 1 : null,
      },
    };
  }
}
