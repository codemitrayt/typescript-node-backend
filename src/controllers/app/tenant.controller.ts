import { Response } from "express";
import { Logger } from "winston";

import { IUser } from "../../types/user.types";
import { TenantService } from "../../services";
import { ApiError, ApiResponse } from "../../utils";
import { ITenant, ITenantFilter } from "../../types/tenant.types";
import { CustomRequest } from "../../types/shared.types";
import { Types } from "mongoose";

export class TenantController {
  constructor(
    private tenantService: TenantService,
    private logger: Logger,
  ) {}

  /* ---------------------------------------------------- */
  /* CREATE TENANT */
  /* ---------------------------------------------------- */

  async create(req: CustomRequest<ITenant>, res: Response) {
    const { _id: adminUserId, email } = req.user as IUser;
    const tenantData = req.body;

    this.logger.info({
      msg: "ITenant creation attempt",
      data: tenantData,
      adminUserId,
      adminEmail: email,
    });

    // Unique checks
    const nameExists = await this.tenantService.exists({
      name: tenantData.name,
    });
    if (nameExists) {
      throw new ApiError(409, "ITenant name already exists.");
    }

    const emailExists = await this.tenantService.exists({
      email: tenantData.email,
    });
    if (emailExists) {
      throw new ApiError(409, "ITenant email already exists.");
    }

    const domainExists = await this.tenantService.exists({
      domain: tenantData.domain,
    });
    if (domainExists) {
      throw new ApiError(409, "ITenant domain already exists.");
    }

    const createdTenant = await this.tenantService.create({
      ...tenantData,
      createdBy: new Types.ObjectId(adminUserId),
    });

    return res
      .status(201)
      .json(
        new ApiResponse(201, createdTenant, "ITenant created successfully."),
      );
  }

  /* ---------------------------------------------------- */
  /* GET TENANT BY ID */
  /* ---------------------------------------------------- */

  async getById(req: CustomRequest, res: Response) {
    const { email } = req.user as IUser;
    const { id } = req.params as unknown as { id: string };

    this.logger.info({ msg: "ITenant get by id attempt", email, id });

    const tenant = await this.tenantService.getById(id);
    if (!tenant) {
      throw new ApiError(404, "ITenant not found.");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, tenant, "ITenant fetched successfully."));
  }

  /* ---------------------------------------------------- */
  /* LIST TENANTS */
  /* ---------------------------------------------------- */

  async list(req: CustomRequest, res: Response) {
    const { email } = req.user as IUser;
    this.logger.info({ msg: "ITenant list attempt", email });

    const query = req.query as ITenantFilter;
    const result = await this.tenantService.list(query);

    return res
      .status(200)
      .json(new ApiResponse(200, result, "Tenants fetched successfully."));
  }

  /* ---------------------------------------------------- */
  /* UPDATE TENANT */
  /* ---------------------------------------------------- */

  async update(req: CustomRequest<ITenant>, res: Response) {
    const { email } = req.user as IUser;
    const { id } = req.params as unknown as { id: string };
    const updateData = req.body as Partial<ITenant>;

    this.logger.info({ msg: "ITenant update attempt", email, updateData });

    this.logger.info({
      msg: "ITenant update attempt",
      tenantId: id,
      data: updateData,
    });

    const updatedTenant = await this.tenantService.updateById(id, updateData);

    if (!updatedTenant) {
      throw new ApiError(404, "ITenant not found.");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedTenant, "ITenant updated successfully."),
      );
  }

  /* ---------------------------------------------------- */
  /* DELETE TENANT */
  /* ---------------------------------------------------- */

  async delete(req: CustomRequest, res: Response) {
    const { email } = req.user as IUser;
    const { id } = req.params as unknown as { id: string };

    this.logger.info({ msg: "ITenant delete attempt", email, id });

    this.logger.info({
      msg: "ITenant deletion attempt",
      tenantId: id,
    });

    const deletedTenant = await this.tenantService.deleteById(id);

    if (!deletedTenant) {
      throw new ApiError(404, "ITenant not found.");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, deletedTenant, "ITenant deleted successfully."),
      );
  }
}
