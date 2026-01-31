import { SortOrder, UpdateQuery } from "mongoose";

import { UserModel } from "../../models";
import { Filter } from "../../types/shared.types";
import { User, IUserFilter } from "../../types/user.types";

class UserService {
  constructor(private model: typeof UserModel) {}

  /**
   * Create a new user
   * @param userData - User data to create
   * @returns Created user document
   */
  async create(userData: Partial<User>): Promise<User> {
    const user = new this.model(userData);
    const savedUser = await user.save();
    return savedUser.toObject();
  }

  /**
   * Get a single user by ID
   * @param id - User ID
   * @returns User document or null
   */
  async getById(id: string): Promise<User | null> {
    const user = await this.model.findById(id).lean();
    return user;
  }

  /**
   * Get a single user by filter criteria
   * @param filter - MongoDB filter query
   * @returns User document or null
   */
  async getOne(filter: Record<string, unknown>): Promise<User | null> {
    const user = await this.model.findOne(filter).lean();
    return user;
  }

  /**
   * Get list of users with pagination and filtering
   * @param filters - Filter options
   * @returns Paginated list of users
   */
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

    // Build search query
    const searchQuery: Filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Execute queries in parallel
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

  /**
   * Get all users without pagination
   * @param filter - MongoDB filter query
   * @returns Array of users
   */
  async getAll(filter: Filter = {}): Promise<User[]> {
    const users = await this.model.find(filter).lean();
    return users;
  }

  /**
   * Update a user by ID
   * @param id - User ID
   * @param updateData - Data to update
   * @returns Updated user document
   */
  async updateById(
    id: string,
    updateData: UpdateQuery<User>,
  ): Promise<User | null> {
    const updatedUser = await this.model
      .findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      })
      .lean();

    return updatedUser;
  }

  /**
   * Update a user by filter criteria
   * @param filter - MongoDB filter query
   * @param updateData - Data to update
   * @returns Updated user document
   */
  async updateOne(
    filter: Filter,
    updateData: UpdateQuery<User>,
  ): Promise<User | null> {
    const updatedUser = await this.model
      .findOneAndUpdate(filter, updateData, {
        new: true,
        runValidators: true,
      })
      .lean();

    return updatedUser;
  }

  /**
   * Update multiple users
   * @param filter - MongoDB filter query
   * @param updateData - Data to update
   * @returns Update result
   */
  async updateMany(filter: Filter, updateData: UpdateQuery<User>) {
    const result = await this.model.updateMany(filter, updateData, {
      runValidators: true,
    });

    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    };
  }

  /**
   * Delete a user by ID
   * @param id - User ID
   * @returns Deleted user document
   */
  async deleteById(id: string): Promise<User | null> {
    const deletedUser = await this.model.findByIdAndDelete(id).lean();
    return deletedUser;
  }

  /**
   * Delete a user by filter criteria
   * @param filter - MongoDB filter query
   * @returns Deleted user document
   */
  async deleteOne(filter: Filter): Promise<User | null> {
    const deletedUser = await this.model.findOneAndDelete(filter).lean();
    return deletedUser;
  }

  /**
   * Delete multiple users
   * @param filter - MongoDB filter query
   * @returns Delete result
   */
  async deleteMany(filter: Filter) {
    const result = await this.model.deleteMany(filter);
    return {
      deletedCount: result.deletedCount,
    };
  }

  /**
   * Check if user exists
   * @param filter - MongoDB filter query
   * @returns Boolean indicating existence
   */
  async exists(filter: Filter): Promise<boolean> {
    const count = await this.model.countDocuments(filter);
    return count > 0;
  }

  /**
   * Count users matching filter
   * @param filter - MongoDB filter query
   * @returns Count of matching users
   */
  async count(filter: Filter = {}): Promise<number> {
    const count = await this.model.countDocuments(filter);
    return count;
  }

  /**
   * Bulk create users
   * @param users - Array of user data
   * @returns Array of created users
   */
  async bulkCreate(users: Partial<User>[]): Promise<User[]> {
    const createdUsers = await this.model.insertMany(users);
    return createdUsers.map((user) => user.toObject());
  }
}

export default UserService;
