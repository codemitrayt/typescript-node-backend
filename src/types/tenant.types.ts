import { Tenant } from "../entities";

export interface ITenantFilter {
  page?: number;
  limit?: number;
  sortBy?: keyof Tenant;
  sortOrder?: "ASC" | "DESC";
  search?: string;
}
