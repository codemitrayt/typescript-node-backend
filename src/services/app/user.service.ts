import { SortOrder, UpdateQuery } from "mongoose";

import { UserModel } from "../../models";
import { Filter } from "../../types/shared.types";
import { IUser, IUserFilter } from "../../types/user.types";

export class UserService {
  constructor(private model: typeof UserModel) {}

  async create(userData: Partial<IUser>): Promise<IUser> {
    const user = new this.model(userData);
    const savedUser = await user.save();
    return savedUser.toObject();
  }

  async getById(id: string): Promise<IUser | null> {
    return await this.model.findById(id).lean();
  }

  async getOne(filter: Record<string, unknown>): Promise<IUser | null> {
    return await this.model.findOne(filter).lean();
  }

  async list(filters: IUserFilter = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      search = "",
    } = filters;

    const skip = (page - 1) * limit;
    const sortOptions: Record<string, SortOrder> = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    const searchQuery: Filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.model
        .find(searchQuery)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.model.countDocuments(searchQuery),
    ]);

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

  async getAll(filter: Filter = {}): Promise<IUser[]> {
    return await this.model.find(filter).lean();
  }

  async updateById(
    id: string,
    updateData: UpdateQuery<IUser>,
  ): Promise<IUser | null> {
    return await this.model
      .findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      })
      .lean();
  }

  async updateOne(
    filter: Filter,
    updateData: UpdateQuery<IUser>,
  ): Promise<IUser | null> {
    return await this.model
      .findOneAndUpdate(filter, updateData, {
        new: true,
        runValidators: true,
      })
      .lean();
  }

  async updateMany(filter: Filter, updateData: UpdateQuery<IUser>) {
    const result = await this.model.updateMany(filter, updateData, {
      runValidators: true,
    });

    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    };
  }

  async deleteById(id: string): Promise<IUser | null> {
    return await this.model.findByIdAndDelete(id).lean();
  }

  async deleteOne(filter: Filter): Promise<IUser | null> {
    return await this.model.findOneAndDelete(filter).lean();
  }

  async deleteMany(filter: Filter) {
    const result = await this.model.deleteMany(filter);
    return {
      deletedCount: result.deletedCount,
    };
  }

  async exists(filter: Filter): Promise<boolean> {
    const count = await this.model.countDocuments(filter);
    return count > 0;
  }

  async count(filter: Filter = {}): Promise<number> {
    const count = await this.model.countDocuments(filter);
    return count;
  }

  async bulkCreate(users: Partial<IUser>[]): Promise<IUser[]> {
    const createdUsers = await this.model.insertMany(users);
    return createdUsers.map((user) => user.toObject());
  }
}
