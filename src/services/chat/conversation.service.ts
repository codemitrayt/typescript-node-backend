import { Model, UpdateQuery } from "mongoose";
import {
  IConversation,
  IConversationFilter,
} from "../../types/conversation.types";
import { Filter } from "../../types/shared.types";

const projection = {
  title: 1,
  model: 1,
  systemPrompt: 1,
  taskType: 1,
  isPinned: 1,
  lastMessageAt: 1,
  createdAt: 1,
  updatedAt: 1,
};

export class ConversationService {
  constructor(private model: Model<IConversation>) {}

  /* -------------------------------------------------------------------------- */
  /*                                   CREATE                                   */
  /* -------------------------------------------------------------------------- */

  async create(data: Partial<IConversation>) {
    return await this.model.create(data);
  }

  async bulkCreate(conversations: Partial<IConversation>[]) {
    return await this.model.insertMany(conversations);
  }

  /* -------------------------------------------------------------------------- */
  /*                                    READ                                    */
  /* -------------------------------------------------------------------------- */

  async getById(id: string) {
    return await this.model
      .findOne({ _id: id, isDeleted: false }, projection)
      .populate("createdBy", "fullName email avatar")
      .populate("assignees", "fullName email avatar")
      .lean();
  }

  async getOne(filter: Filter) {
    return await this.model
      .findOne({ ...filter, isDeleted: false }, projection)
      .populate("createdBy", "fullName email avatar")
      .populate("assignees", "fullName email avatar")
      .lean();
  }

  async getAll(filter: Filter = {}) {
    return await this.model
      .find({ ...filter, isDeleted: false })
      .populate("createdBy", "fullName email avatar")
      .populate("assignees", "fullName email avatar")
      .lean();
  }

  async list(filters: IConversationFilter = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = "lastMessageAt",
      sortOrder = "DESC",
      search = "",
      createdBy,
      isPinned,
    } = filters;

    const skip = (page - 1) * limit;

    const query: Filter = {
      isDeleted: false,
    };

    if (createdBy) {
      query.createdBy = createdBy;
    }

    if (typeof isPinned === "boolean") {
      query.isPinned = isPinned;
    }

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [{ title: regex }, { model: regex }, { taskType: regex }];
    }

    const allowedSortFields = [
      "title",
      "model",
      "taskType",
      "createdAt",
      "updatedAt",
      "lastMessageAt",
    ];

    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "lastMessageAt";

    const sortDirection = sortOrder === "DESC" ? -1 : 1;

    const [data, total] = await Promise.all([
      this.model
        .find(query, projection)
        .populate("createdBy", "fullName email avatar")
        .populate("assignees", "fullName email avatar")
        .sort({ [safeSortBy]: sortDirection })
        .skip(skip)
        .limit(limit)
        .lean(),

      this.model.countDocuments(query),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   UPDATE                                   */
  /* -------------------------------------------------------------------------- */

  async updateById(id: string, updateData: UpdateQuery<IConversation>) {
    return await this.model
      .findOneAndUpdate({ _id: id, isDeleted: false }, updateData, {
        new: true,
      })
      .lean();
  }

  async updateOne(filter: Filter, updateData: UpdateQuery<IConversation>) {
    return await this.model
      .findOneAndUpdate({ ...filter, isDeleted: false }, updateData, {
        new: true,
      })
      .lean();
  }

  async updateMany(filter: Filter, updateData: UpdateQuery<IConversation>) {
    const result = await this.model.updateMany(
      { ...filter, isDeleted: false },
      updateData,
    );

    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   DELETE                                   */
  /* -------------------------------------------------------------------------- */

  // Soft delete
  async deleteById(id: string) {
    return await this.model
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true },
        { new: true },
      )
      .lean();
  }

  async deleteOne(filter: Filter) {
    return await this.model
      .findOneAndUpdate(
        { ...filter, isDeleted: false },
        { isDeleted: true },
        { new: true },
      )
      .lean();
  }

  async deleteMany(filter: Filter) {
    const result = await this.model.updateMany(
      { ...filter, isDeleted: false },
      { isDeleted: true },
    );

    return { deletedCount: result.modifiedCount };
  }

  /* -------------------------------------------------------------------------- */
  /*                                  UTILITIES                                 */
  /* -------------------------------------------------------------------------- */

  async exists(filter: Filter) {
    const result = await this.model.exists({
      ...filter,
      isDeleted: false,
    });
    return !!result;
  }

  async count(filter: Filter = {}) {
    return await this.model.countDocuments({
      ...filter,
      isDeleted: false,
    });
  }
}
