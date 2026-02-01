import { Logger } from "winston";
import { Response } from "express";
import { ObjectId } from "mongoose";

import { ConsignmentService, DocumentService } from "../../services";

import { IUser } from "../../types/user.types";
import { ApiError, ApiResponse } from "../../utils";
import { IConsignment } from "../../types/consignment.types";
import { CustomRequest, ISearchFilter } from "../../types/shared.types";

export class ConsignmentController {
  constructor(
    private consignmentService: ConsignmentService,
    private documentService: DocumentService,
    private logger: Logger,
  ) {}

  async create(req: CustomRequest<IConsignment>, res: Response) {
    const { email, _id: userId } = req.user as IUser;
    const consignmentData = req.body;

    this.logger.info({
      msg: "Consignment creation attempt",
      data: consignmentData,
      email,
      userId,
    });

    const consignment = await this.consignmentService.create({
      ...consignmentData,
      createdBy: userId as unknown as ObjectId,
    });

    return res
      .status(201)
      .json(
        new ApiResponse(201, consignment, "Consignment created successfully"),
      );
  }

  async update(req: CustomRequest<IConsignment>, res: Response) {
    const { email } = req.user as IUser;
    const consignmentData = req.body;
    const { consignmentId } = req.params as { consignmentId: string };

    this.logger.info({
      msg: "Consignment update attempt",
      data: consignmentData,
      consignmentId,
      email,
    });

    const consignment = await this.consignmentService.updateById(
      consignmentId,
      consignmentData,
    );
    if (!consignment) throw new ApiError(404, "Consignment not found");

    return res
      .status(200)
      .json(
        new ApiResponse(200, consignment, "Consignment updated successfully"),
      );
  }

  async delete(req: CustomRequest, res: Response) {
    const { email } = req.user as IUser;
    const { consignmentId } = req.params as { consignmentId: string };

    this.logger.info({
      msg: "Consignment delete attempt",
      consignmentId,
      email,
    });

    const consignment = await this.consignmentService.updateById(
      consignmentId,
      { isDeleted: true },
    );
    if (!consignment) throw new ApiError(404, "Consignment not found");

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          consignment,
          "Consignment soft deleted successfully",
        ),
      );
  }

  async list(req: CustomRequest, res: Response) {
    const { email } = req.user as IUser;
    const query = req.query as ISearchFilter;

    this.logger.info({ msg: "Consignment list", email, query });

    const list = await this.consignmentService.list(query);
    return res
      .status(200)
      .json(
        new ApiResponse(200, list, "Consignment list fetched successfully"),
      );
  }

  async get(req: CustomRequest, res: Response) {
    const { email } = req.user as IUser;
    const { consignmentId } = req.params as { consignmentId: string };

    this.logger.info({ msg: "Get consignemt", email, consignmentId });

    const consignment = await this.consignmentService.getById(consignmentId);
    if (!consignment) throw new ApiError(404, "Consignment not found");
    if (consignment.isDeleted)
      throw new ApiError(404, "This consignmet deleted");

    return res
      .status(200)
      .json(
        new ApiResponse(200, consignment, "Consignment fetched successfully"),
      );
  }

  async documentList(req: CustomRequest, res: Response) {
    const { email } = req.user as IUser;
    const { consignmentId } = req.params as { consignmentId: string };
    const { page, limit } = req.query as unknown as {
      page: number;
      limit: number;
    };

    this.logger.info({ msg: "Consignment document list", email });

    const documentList = await this.documentService.documentList({
      consignmentId,
      isDeleted: false,
      page,
      limit,
    });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          documentList,
          "Consignment document list fetched successfully",
        ),
      );
  }
}
