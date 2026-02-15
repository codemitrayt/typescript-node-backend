import { Repository, FindOptionsWhere } from "typeorm";

import { User } from "../../entities";
import { IUserFilter } from "../../types/user.types";

export class UserService {
  constructor(private repository: Repository<User>) {}

  /* ---------------------------------------------------- */
  /* CREATE */
  /* ---------------------------------------------------- */

  async create(userData: Partial<User>): Promise<User> {
    const user = this.repository.create(userData);
    return await this.repository.save(user);
  }

  async bulkCreate(users: Partial<User>[]): Promise<User[]> {
    const entities = this.repository.create(users);
    return await this.repository.save(entities);
  }

  /* ---------------------------------------------------- */
  /* READ */
  /* ---------------------------------------------------- */

  async getById(id: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ["tenant"],
    });
  }

  async getOne(filter: FindOptionsWhere<User>): Promise<User | null> {
    return await this.repository.findOne({
      where: filter,
      relations: ["tenant"],
    });
  }

  async getAll(filter: FindOptionsWhere<User> = {}): Promise<User[]> {
    return await this.repository.find({
      where: filter,
    });
  }

  /* ---------------------------------------------------- */
  /* LIST (Pagination + Search + Sort) */
  /* ---------------------------------------------------- */

  async list(filters: IUserFilter = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "DESC",
      search = "",
    } = filters;

    const skip = (page - 1) * limit;

    const queryBuilder = this.repository.createQueryBuilder("user");

    // Search (case-insensitive)
    if (search) {
      queryBuilder.andWhere(
        "(user.fullName ILIKE :search OR user.email ILIKE :search)",
        { search: `%${search}%` },
      );
    }

    // Sorting
    queryBuilder.orderBy(
      `user.${sortBy}`,
      sortOrder === "DESC" ? "DESC" : "ASC",
    );

    // Pagination
    queryBuilder.skip(skip).take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      data: users,
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

  /* ---------------------------------------------------- */
  /* UPDATE */
  /* ---------------------------------------------------- */

  async updateById(
    id: string,
    updateData: Partial<User>,
  ): Promise<User | null> {
    await this.repository.update(id, updateData);
    return this.getById(id);
  }

  async updateOne(
    filter: FindOptionsWhere<User>,
    updateData: Partial<User>,
  ): Promise<User | null> {
    const user = await this.repository.findOne({ where: filter });
    if (!user) return null;

    Object.assign(user, updateData);
    return await this.repository.save(user);
  }

  async updateMany(filter: FindOptionsWhere<User>, updateData: Partial<User>) {
    const result = await this.repository.update(filter, updateData);

    return {
      matchedCount: result.affected ?? 0,
      modifiedCount: result.affected ?? 0,
    };
  }

  /* ---------------------------------------------------- */
  /* DELETE */
  /* ---------------------------------------------------- */

  async deleteById(id: string): Promise<User | null> {
    const user = await this.getById(id);
    if (!user) return null;

    await this.repository.delete(id);
    return user;
  }

  async deleteOne(filter: FindOptionsWhere<User>): Promise<User | null> {
    const user = await this.repository.findOne({ where: filter });
    if (!user) return null;

    await this.repository.delete(user.id);
    return user;
  }

  async deleteMany(filter: FindOptionsWhere<User>) {
    const result = await this.repository.delete(filter);

    return {
      deletedCount: result.affected ?? 0,
    };
  }

  /* ---------------------------------------------------- */
  /* UTILITIES */
  /* ---------------------------------------------------- */

  async exists(filter: FindOptionsWhere<User>): Promise<boolean> {
    const count = await this.repository.count({
      where: filter,
    });
    return count > 0;
  }

  async count(filter: FindOptionsWhere<User> = {}): Promise<number> {
    return await this.repository.count({
      where: filter,
    });
  }
}
