import { Repository, FindOptionsWhere, QueryDeepPartialEntity } from "typeorm";

import { Tenant } from "../../entities";
import { ITenantFilter } from "../../types/tenant.types";

const selector = {
  id: true,
  name: true,
  email: true,
  domain: true,
  websiteUrl: true,
  createdAt: true,
  updatedAt: true,
  creator: { id: true, fullName: true, email: true, avatar: true },
};

export class TenantService {
  constructor(private repository: Repository<Tenant>) {}

  async create(tenantData: Partial<Tenant>): Promise<Tenant> {
    const tenant = this.repository.create(tenantData);
    return await this.repository.save(tenant);
  }

  async bulkCreate(tenants: Partial<Tenant>[]): Promise<Tenant[]> {
    const entities = this.repository.create(tenants);
    return await this.repository.save(entities);
  }

  async getById(id: string): Promise<Tenant | null> {
    return await this.repository.findOne({
      where: { id },
      relations: { creator: true },
      select: selector,
    });
  }

  async getOne(filter: FindOptionsWhere<Tenant>): Promise<Tenant | null> {
    return await this.repository.findOne({
      where: filter,
      relations: { creator: true },
      select: selector,
    });
  }

  async getAll(filter: FindOptionsWhere<Tenant> = {}): Promise<Tenant[]> {
    return await this.repository.find({
      where: filter,
      relations: ["creator"],
    });
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

    const queryBuilder = this.repository.createQueryBuilder("tenant");

    if (search) {
      queryBuilder.andWhere(
        `(tenant.name ILIKE :search 
          OR tenant.email ILIKE :search
          OR tenant.domain ILIKE :search
          OR tenant.websiteUrl ILIKE :search)`,
        { search: `%${search}%` },
      );
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

    queryBuilder.orderBy(
      `tenant.${safeSortBy}`,
      sortOrder === "DESC" ? "DESC" : "ASC",
    );

    queryBuilder.skip(skip).take(limit);

    queryBuilder
      .leftJoinAndSelect("tenant.creator", "creator")
      .select([
        "tenant.id",
        "tenant.name",
        "tenant.email",
        "tenant.domain",
        "tenant.websiteUrl",
        "tenant.createdAt",
        "tenant.updatedAt",

        "creator.id",
        "creator.fullName",
        "creator.email",
        "creator.avatar",
      ]);

    const [tenants, total] = await queryBuilder.getManyAndCount();

    return {
      data: tenants,
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

  async updateById(
    id: string,
    updateData: QueryDeepPartialEntity<Tenant>,
  ): Promise<Tenant | null> {
    await this.repository.update(id, updateData);
    return this.getById(id);
  }

  async updateOne(
    filter: FindOptionsWhere<Tenant>,
    updateData: Partial<Tenant>,
  ): Promise<Tenant | null> {
    const tenant = await this.repository.findOne({ where: filter });
    if (!tenant) return null;

    Object.assign(tenant, updateData);
    return await this.repository.save(tenant);
  }

  async updateMany(
    filter: FindOptionsWhere<Tenant>,
    updateData: QueryDeepPartialEntity<Tenant>,
  ) {
    const result = await this.repository.update(filter, updateData);

    return {
      matchedCount: result.affected ?? 0,
      modifiedCount: result.affected ?? 0,
    };
  }

  async deleteById(id: string): Promise<Tenant | null> {
    const tenant = await this.getById(id);
    if (!tenant) return null;

    await this.repository.delete(id);
    return tenant;
  }

  async deleteOne(filter: FindOptionsWhere<Tenant>): Promise<Tenant | null> {
    const tenant = await this.repository.findOne({ where: filter });
    if (!tenant) return null;

    await this.repository.delete(tenant.id);
    return tenant;
  }

  async deleteMany(filter: FindOptionsWhere<Tenant>) {
    const result = await this.repository.delete(filter);

    return { deletedCount: result.affected ?? 0 };
  }

  async exists(filter: FindOptionsWhere<Tenant>): Promise<boolean> {
    const count = await this.repository.count({ where: filter });
    return count > 0;
  }

  async count(filter: FindOptionsWhere<Tenant> = {}): Promise<number> {
    return await this.repository.count({ where: filter });
  }
}
