import { FindOptionsWhere, Repository } from "typeorm";
import { Message } from "../../entities";

export class MessageService {
  constructor(private repository: Repository<Message>) {}

  async create(data: Partial<Message>): Promise<Message> {
    const message = this.repository.create(data);
    return await this.repository.save(message);
  }

  async bulkCreate(messages: Partial<Message>[]): Promise<Message[]> {
    const entities = this.repository.create(messages);
    return await this.repository.save(entities);
  }

  async getById(id: string): Promise<Message | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async getOne(filter: FindOptionsWhere<Message>): Promise<Message | null> {
    return await this.repository.findOne({ where: filter });
  }

  async getAll(filter: FindOptionsWhere<Message> = {}): Promise<Message[]> {
    return await this.repository.find({ where: filter });
  }

  async getListByConversation(params: {
    conversationId: string;
    limit?: number;
    cursorCreatedAt?: string;
    cursorId?: string;
  }): Promise<{
    data: Message[];
    nextCursor: string | null;
  }> {
    const { conversationId, limit = 20, cursorCreatedAt, cursorId } = params;

    const qb = this.repository
      .createQueryBuilder("message")
      .where("message.conversationId = :conversationId", { conversationId });

    if (cursorCreatedAt && cursorId) {
      qb.andWhere(
        `(message.createdAt < :cursorCreatedAt 
          OR (message.createdAt = :cursorCreatedAt AND message.id < :cursorId))`,
        {
          cursorCreatedAt: new Date(cursorCreatedAt),
          cursorId,
        },
      );
    }

    qb.orderBy("message.createdAt", "DESC")
      .addOrderBy("message.id", "DESC")
      .take(limit);

    qb.select([
      "message.id",
      "message.createdAt",
      "message.conversationId",
      "message.content",
    ]);

    const messages = await qb.getMany();
    const ordered = messages.reverse();

    const nextCursor =
      ordered.length > 0
        ? `${ordered[0].createdAt.toISOString()}$${ordered[0].id}`
        : null;

    return { data: ordered, nextCursor };
  }
}
