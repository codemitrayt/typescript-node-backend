import { SortOrder, UpdateQuery } from "mongoose";
import { ConsignmentModel } from "../../models";
import { Filter } from "../../types/shared.types";
import {
  IConsignment,
  IConsignmentFilter,
} from "../../types/consignment.types";

class ConsignmentService {
  constructor(private model: typeof ConsignmentModel) {}

  async create(consignmentData: Partial<IConsignment>) {
    const consignment = new this.model(consignmentData);
    const savedConsignment = await consignment.save();
    return savedConsignment.toObject();
  }

  async getById(id: string): Promise<IConsignment | null> {
    return await this.model.findById(id).lean();
  }

  async getOne(filter: Record<string, unknown>): Promise<IConsignment | null> {
    return await this.model.findOne(filter).lean();
  }

  async list(filters: IConsignmentFilter = {}) {
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
          $or: [{ title: { $regex: search, $options: "i" } }],
        }
      : {};

    const [consignments, total] = await Promise.all([
      this.model
        .find(searchQuery)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.model.countDocuments(searchQuery),
    ]);

    return {
      data: consignments,
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

  async getAll(filter: Filter = {}): Promise<IConsignment[]> {
    return await this.model.find(filter).lean();
  }

  async updateById(
    id: string,
    updateData: UpdateQuery<IConsignment>,
  ): Promise<IConsignment | null> {
    return await this.model
      .findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      })
      .lean();
  }

  async updateOne(
    filter: Filter,
    updateData: UpdateQuery<IConsignment>,
  ): Promise<IConsignment | null> {
    return await this.model
      .findOneAndUpdate(filter, updateData, {
        new: true,
        runValidators: true,
      })
      .lean();
  }

  async updateMany(filter: Filter, updateData: UpdateQuery<IConsignment>) {
    const result = await this.model.updateMany(filter, updateData, {
      runValidators: true,
    });

    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    };
  }

  async deleteById(id: string): Promise<IConsignment | null> {
    return await this.model.findByIdAndDelete(id).lean();
  }

  async deleteOne(filter: Filter): Promise<IConsignment | null> {
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

  async bulkCreate(
    consignment: Partial<IConsignment>[],
  ): Promise<IConsignment[]> {
    const data = await this.model.insertMany(consignment);
    return data.map((user) => user.toObject());
  }
}

export default ConsignmentService;
