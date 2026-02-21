import { Response } from "express";
import { Logger } from "winston";

import { IUser } from "../../types/user.types";
import { ConversationService } from "../../services";
import { ApiError, ApiResponse } from "../../utils";
import { CustomRequest } from "../../types/shared.types";
import {
  IConversation,
  IConversationFilter,
} from "../../types/conversation.types";
import { Types } from "mongoose";

export class ConversationController {
  constructor(
    private conversationService: ConversationService,
    private logger: Logger,
  ) {}

  /* ---------------------------------------------------- */
  /* CREATE CONVERSATION */
  /* ---------------------------------------------------- */

  async create(req: CustomRequest<IConversation>, res: Response) {
    const { _id: userId, email } = req.user as IUser;
    const conversationData = req.body;

    this.logger.info({
      msg: "Conversation creation attempt",
      userId,
      userEmail: email,
      data: conversationData,
    });

    const createdConversation = await this.conversationService.create({
      ...conversationData,
      createdBy: new Types.ObjectId(userId),
      lastMessageAt: new Date(),
    });

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          createdConversation,
          "Conversation created successfully.",
        ),
      );
  }

  /* ---------------------------------------------------- */
  /* GET CONVERSATION BY ID */
  /* ---------------------------------------------------- */

  async getById(req: CustomRequest, res: Response) {
    const { _id: userId, email } = req.user as IUser;
    const { id } = req.params as unknown as { id: string };

    this.logger.info({
      msg: "Conversation get by id attempt",
      userId,
      email,
      conversationId: id,
    });

    const conversation = await this.conversationService.getOne({
      id,
      createdBy: userId,
    });

    if (!conversation) {
      throw new ApiError(404, "Conversation not found.");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          conversation,
          "Conversation fetched successfully.",
        ),
      );
  }

  /* ---------------------------------------------------- */
  /* LIST CONVERSATIONS */
  /* ---------------------------------------------------- */

  async list(req: CustomRequest, res: Response) {
    const { _id: userId, email } = req.user as IUser;

    this.logger.info({
      msg: "Conversation list attempt",
      userId,
      email,
    });

    const query = req.query as IConversationFilter;

    const result = await this.conversationService.list({
      ...query,
      createdBy: userId,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, result, "Conversations fetched successfully."),
      );
  }

  /* ---------------------------------------------------- */
  /* UPDATE CONVERSATION */
  /* ---------------------------------------------------- */

  async update(req: CustomRequest<IConversation>, res: Response) {
    const { _id: userId, email } = req.user as IUser;
    const { id } = req.params as unknown as { id: string };
    const updateData = req.body as Partial<IConversation>;

    this.logger.info({
      msg: "Conversation update attempt",
      userId,
      email,
      conversationId: id,
      data: updateData,
    });

    const existingConversation = await this.conversationService.getOne({
      id,
      createdBy: userId,
    });

    if (!existingConversation) {
      throw new ApiError(404, "Conversation not found.");
    }

    const updatedConversation = await this.conversationService.updateById(
      id,
      updateData,
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedConversation,
          "Conversation updated successfully.",
        ),
      );
  }

  /* ---------------------------------------------------- */
  /* DELETE CONVERSATION (SOFT DELETE) */
  /* ---------------------------------------------------- */

  async delete(req: CustomRequest, res: Response) {
    const { _id: userId, email } = req.user as IUser;
    const { id } = req.params as unknown as { id: string };

    this.logger.info({
      msg: "Conversation delete attempt",
      userId,
      email,
      conversationId: id,
    });

    const existingConversation = await this.conversationService.getOne({
      id,
      createdBy: userId,
    });

    if (!existingConversation) {
      throw new ApiError(404, "Conversation not found.");
    }

    const deletedConversation = await this.conversationService.deleteById(id);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          deletedConversation,
          "Conversation deleted successfully.",
        ),
      );
  }

  /* ---------------------------------------------------- */
  /* TOGGLE PIN */
  /* ---------------------------------------------------- */

  async togglePin(req: CustomRequest, res: Response) {
    const { _id: userId } = req.user as IUser;
    const { id } = req.params as unknown as { id: string };

    const conversation = await this.conversationService.getOne({
      id,
      createdBy: userId,
    });

    if (!conversation) {
      throw new ApiError(404, "Conversation not found.");
    }

    const updated = await this.conversationService.updateById(id, {
      isPinned: !conversation.isPinned,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updated,
          `Conversation ${
            conversation.isPinned ? "unpinned" : "pinned"
          } successfully.`,
        ),
      );
  }
}
