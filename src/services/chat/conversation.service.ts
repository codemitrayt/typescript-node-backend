import { Repository, FindOptionsWhere, QueryDeepPartialEntity } from "typeorm";
import { Conversation } from "../../entities";
import { IConversationFilter } from "../../types/conversation.types";

const selector = {
  id: true,
  title: true,
  model: true,
  systemPrompt: true,
  taskType: true,
  isPinned: true,
  lastMessageAt: true,
  createdAt: true,
  updatedAt: true,
  creator: {
    id: true,
    fullName: true,
    email: true,
    avatar: true,
  },
};

export class ConversationService {
  constructor(private repository: Repository<Conversation>) {}

  /* -------------------------------------------------------------------------- */
  /*                                   CREATE                                   */
  /* -------------------------------------------------------------------------- */

  async create(data: Partial<Conversation>): Promise<Conversation> {
    const conversation = this.repository.create(data);
    return await this.repository.save(conversation);
  }

  async bulkCreate(
    conversations: Partial<Conversation>[],
  ): Promise<Conversation[]> {
    const entities = this.repository.create(conversations);
    return await this.repository.save(entities);
  }

  /* -------------------------------------------------------------------------- */
  /*                                    READ                                    */
  /* -------------------------------------------------------------------------- */

  async getById(id: string): Promise<Conversation | null> {
    return await this.repository.findOne({
      where: { id, isDeleted: false },
      relations: {
        creator: true,
        assignees: true,
      },
      select: selector,
    });
  }

  async getOne(
    filter: FindOptionsWhere<Conversation>,
  ): Promise<Conversation | null> {
    return await this.repository.findOne({
      where: { ...filter, isDeleted: false },
      relations: {
        creator: true,
        assignees: true,
      },
      select: selector,
    });
  }

  async getAll(
    filter: FindOptionsWhere<Conversation> = {},
  ): Promise<Conversation[]> {
    return await this.repository.find({
      where: { ...filter, isDeleted: false },
      relations: ["creator", "assignees"],
    });
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

    const queryBuilder = this.repository.createQueryBuilder("conversation");

    queryBuilder.where("conversation.isDeleted = false");

    if (createdBy) {
      queryBuilder.andWhere("conversation.createdBy = :createdBy", {
        createdBy,
      });
    }

    if (typeof isPinned === "boolean") {
      queryBuilder.andWhere("conversation.isPinned = :isPinned", {
        isPinned,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        `(conversation.title ILIKE :search
            OR conversation.model ILIKE :search
            OR conversation.taskType ILIKE :search)`,
        { search: `%${search}%` },
      );
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

    queryBuilder.orderBy(
      `conversation.${safeSortBy}`,
      sortOrder === "DESC" ? "DESC" : "ASC",
    );

    queryBuilder.skip(skip).take(limit);

    queryBuilder
      .leftJoinAndSelect("conversation.creator", "creator")
      .leftJoinAndSelect("conversation.assignees", "assignees")
      .select([
        "conversation.id",
        "conversation.title",
        "conversation.model",
        "conversation.taskType",
        "conversation.isPinned",
        "conversation.lastMessageAt",
        "conversation.createdAt",
        "conversation.updatedAt",

        "creator.id",
        "creator.fullName",
        "creator.email",
        "creator.avatar",

        "assignees.id",
        "assignees.fullName",
        "assignees.email",
        "assignees.avatar",
      ]);

    const [conversations, total] = await queryBuilder.getManyAndCount();

    return {
      data: conversations,
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

  async updateById(
    id: string,
    updateData: QueryDeepPartialEntity<Conversation>,
  ): Promise<Conversation | null> {
    await this.repository.update(id, updateData);
    return this.getById(id);
  }

  async updateOne(
    filter: FindOptionsWhere<Conversation>,
    updateData: Partial<Conversation>,
  ): Promise<Conversation | null> {
    const conversation = await this.repository.findOne({
      where: { ...filter, isDeleted: false },
    });

    if (!conversation) return null;

    Object.assign(conversation, updateData);
    return await this.repository.save(conversation);
  }

  async updateMany(
    filter: FindOptionsWhere<Conversation>,
    updateData: QueryDeepPartialEntity<Conversation>,
  ) {
    const result = await this.repository.update(
      { ...filter, isDeleted: false },
      updateData,
    );

    return {
      matchedCount: result.affected ?? 0,
      modifiedCount: result.affected ?? 0,
    };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   DELETE                                   */
  /* -------------------------------------------------------------------------- */

  // Soft delete
  async deleteById(id: string): Promise<Conversation | null> {
    const conversation = await this.getById(id);
    if (!conversation) return null;

    await this.repository.update(id, { isDeleted: true });
    return conversation;
  }

  async deleteOne(
    filter: FindOptionsWhere<Conversation>,
  ): Promise<Conversation | null> {
    const conversation = await this.repository.findOne({
      where: { ...filter, isDeleted: false },
    });

    if (!conversation) return null;

    await this.repository.update(conversation.id, {
      isDeleted: true,
    });

    return conversation;
  }

  async deleteMany(filter: FindOptionsWhere<Conversation>) {
    const result = await this.repository.update(
      { ...filter, isDeleted: false },
      { isDeleted: true },
    );

    return { deletedCount: result.affected ?? 0 };
  }

  /* -------------------------------------------------------------------------- */
  /*                                  UTILITIES                                 */
  /* -------------------------------------------------------------------------- */

  async exists(filter: FindOptionsWhere<Conversation>): Promise<boolean> {
    const count = await this.repository.count({
      where: { ...filter, isDeleted: false },
    });
    return count > 0;
  }

  async count(filter: FindOptionsWhere<Conversation> = {}): Promise<number> {
    return await this.repository.count({
      where: { ...filter, isDeleted: false },
    });
  }
}
