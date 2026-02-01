import { Logger } from "winston";
import { Response } from "express";
import { ObjectId } from "mongoose";

import { DocumentService } from "../../services";

import { IUser } from "../../types/user.types";
import { ApiError, ApiResponse } from "../../utils";
import { IDocument } from "../../types/document.types";
import { CustomRequest, ISearchFilter } from "../../types/shared.types";
import { publishMessage } from "../../utils/publisher";

export class DocumentController {
  constructor(
    private documentService: DocumentService,
    private logger: Logger,
  ) {}

  async create(req: CustomRequest<IDocument>, res: Response) {
    const { email, _id: userId } = req.user as IUser;
    const documentData = req.body;

    this.logger.info({
      msg: "Document creation attempt",
      data: documentData,
      email,
    });

    const document = await this.documentService.create({
      ...documentData,
      createdBy: userId as unknown as ObjectId,
    });

    const message = {
      task_id: document._id.toString(),
      invoice: document.files
        .filter((file) => file.type === "Invoices")
        .map(
          (file) =>
            `https://storage.googleapis.com/exportkaro/${file.fileName}`,
        ),
      awb: document.files
        .filter((file) => file.type === "Airway")
        .map(
          (file) =>
            `https://storage.googleapis.com/exportkaro/${file.fileName}`,
        ),
      pl: document.files
        .filter((file) => file.type === "Packaging List")
        .map(
          (file) =>
            `https://storage.googleapis.com/exportkaro/${file.fileName}`,
        ),
    };
    publishMessage(message);

    return res
      .status(201)
      .json(new ApiResponse(201, document, "Document created successfully"));
  }

  async update(req: CustomRequest<IDocument>, res: Response) {
    const { email } = req.user as IUser;
    const documentData = req.body;
    const { documentId } = req.params as { documentId: string };

    this.logger.info({
      msg: "Document update attempt",
      data: documentData,
      documentId,
      email,
    });

    const document = await this.documentService.updateById(
      documentId,
      documentData,
    );
    if (!document) throw new ApiError(404, "Document not found");

    return res
      .status(200)
      .json(new ApiResponse(200, document, "Document updated successfully"));
  }

  async delete(req: CustomRequest, res: Response) {
    const { email } = req.user as IUser;
    const { documentId } = req.params as { documentId: string };

    this.logger.info({
      msg: "Document delete attempt",
      documentId,
      email,
    });

    const document = await this.documentService.updateById(documentId, {
      isDeleted: true,
    });
    if (!document) throw new ApiError(404, "Document not found");

    return res
      .status(200)
      .json(
        new ApiResponse(200, document, "Document soft deleted successfully"),
      );
  }

  async list(req: CustomRequest, res: Response) {
    const { email } = req.user as IUser;
    const query = req.query as ISearchFilter;

    this.logger.info({ msg: "Document list", email, query });

    const list = await this.documentService.list(query);
    return res
      .status(200)
      .json(new ApiResponse(200, list, "Document list fetched successfully"));
  }

  async get(req: CustomRequest, res: Response) {
    const { email } = req.user as IUser;
    const { documentId } = req.params as { documentId: string };

    this.logger.info({ msg: "Get document", email, documentId });

    const document = await this.documentService.getById(documentId);
    if (!document) throw new ApiError(404, "Document not found");
    if (document.isDeleted) throw new ApiError(404, "This document deleted");

    return res
      .status(200)
      .json(new ApiResponse(200, document, "Document fetched successfully"));
  }
}
