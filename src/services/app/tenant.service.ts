import { Model, UpdateQuery } from "mongoose";

import { Filter } from "../../types/shared.types";
import { ITenant, ITenantFilter } from "../../types/tenant.types";

const projection = {
  name: 1,
  email: 1,
  domain: 1,
  websiteUrl: 1,
  createdAt: 1,
  updatedAt: 1,
};

export class TenantService {
  constructor(private model: Model<ITenant>) {}

  async create(tenantData: Partial<ITenant>) {
    return await this.model.create(tenantData);
  }

  async bulkCreate(tenants: Partial<ITenant>[]) {
    return await this.model.insertMany(tenants);
  }

  async getById(id: string) {
    return await this.model
      .findById(id, projection)
      .populate("createdBy", "id fullName email avatar")
      .lean();
  }

  async getOne(filter: Filter) {
    return await this.model
      .findOne(filter, projection)
      .populate("createdBy", "id fullName email avatar")
      .lean();
  }

  async getAll(filter: Filter = {}) {
    return await this.model
      .find(filter)
      .populate("createdBy", "id fullName email avatar")
      .lean();
  }

  async list(filters: ITenantFilter = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "DESC",
      search = "",
    } = filters;

    const skip = (page - 1) * limit;

    const query: Filter = {};

    // 🔎 Search (ILIKE equivalent)
    if (search) {
      const regex = new RegExp(search, "i");

      query.$or = [
        { name: regex },
        { email: regex },
        { domain: regex },
        { websiteUrl: regex },
      ];
    }

    const allowedSortFields = [
      "name",
      "email",
      "domain",
      "websiteUrl",
      "createdAt",
    ];

    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";

    const sortDirection = sortOrder === "DESC" ? -1 : 1;

    const [data, total] = await Promise.all([
      this.model
        .find(query, projection)
        .populate("createdBy", "id fullName email avatar")
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

  async updateById(id: string, updateData: UpdateQuery<ITenant>) {
    return await this.model
      .findByIdAndUpdate(id, updateData, { new: true })
      .lean();
  }

  async updateOne(filter: Filter, updateData: UpdateQuery<ITenant>) {
    return await this.model
      .findOneAndUpdate(filter, updateData, { new: true })
      .lean();
  }

  async updateMany(filter: Filter, updateData: UpdateQuery<ITenant>) {
    const result = await this.model.updateMany(filter, updateData);

    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    };
  }

  async deleteById(id: string) {
    return await this.model.findByIdAndDelete(id).lean();
  }

  async deleteOne(filter: Filter) {
    return await this.model.findOneAndDelete(filter).lean();
  }

  async deleteMany(filter: Filter) {
    const result = await this.model.deleteMany(filter);
    return { deletedCount: result.deletedCount };
  }

  async exists(filter: Filter) {
    const count = await this.model.exists(filter);
    return !!count;
  }

  async count(filter: Filter = {}) {
    return await this.model.countDocuments(filter);
  }
}
