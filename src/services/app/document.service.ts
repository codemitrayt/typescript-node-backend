import { SortOrder, UpdateQuery } from "mongoose";

import { DocumentModel } from "../../models";
import { IDocument } from "../../types/document.types";
import { Filter, ISearchFilter } from "../../types/shared.types";

class DocumentService {
  constructor(private model: typeof DocumentModel) {}

  async create(consignmentData: Partial<IDocument>) {
    const document = new this.model(consignmentData);
    const savedConsignment = await document.save();
    return savedConsignment.toObject();
  }

  async getById(id: string): Promise<IDocument | null> {
    return await this.model.findById(id).lean();
  }

  async getOne(filter: Record<string, unknown>): Promise<IDocument | null> {
    return await this.model.findOne(filter).lean();
  }

  async list(filters: ISearchFilter = {}) {
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

  async getAll(filter: Filter = {}): Promise<IDocument[]> {
    return await this.model.find(filter).lean();
  }

  async updateById(
    id: string,
    updateData: UpdateQuery<IDocument>,
  ): Promise<IDocument | null> {
    return await this.model
      .findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      })
      .lean();
  }

  async updateOne(
    filter: Filter,
    updateData: UpdateQuery<IDocument>,
  ): Promise<IDocument | null> {
    return await this.model
      .findOneAndUpdate(filter, updateData, {
        new: true,
        runValidators: true,
      })
      .lean();
  }

  async updateMany(filter: Filter, updateData: UpdateQuery<IDocument>) {
    const result = await this.model.updateMany(filter, updateData, {
      runValidators: true,
    });

    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    };
  }

  async deleteById(id: string): Promise<IDocument | null> {
    return await this.model.findByIdAndDelete(id).lean();
  }

  async deleteOne(filter: Filter): Promise<IDocument | null> {
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

  async bulkCreate(document: Partial<IDocument>[]): Promise<IDocument[]> {
    const data = await this.model.insertMany(document);
    return data.map((user) => user.toObject());
  }
}

export default DocumentService;
