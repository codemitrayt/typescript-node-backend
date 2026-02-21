import { Logger } from "winston";
import { Response } from "express";

import { ApiResponse } from "../../utils";
import { Message } from "../../entities";
import { IUser } from "../../types/user.types";
import { CustomRequest } from "../../types/shared.types";
import { IMessageList } from "../../types/message.types";
import { MessageService } from "../../services/chat/message.service";

export class MessageController {
  constructor(
    private messageService: MessageService,
    private logger: Logger,
  ) {}

  async list(req: CustomRequest, res: Response) {
    const { id: userId, email } = req.user as IUser;
    const query = req.query as unknown as IMessageList;

    this.logger.info({
      msg: "Conversation message list attempt",
      userId,
      userEmail: email,
      query,
    });

    const cursor = query.cursor?.split("$");

    const result = await this.messageService.getListByConversation({
      ...query,
      cursorCreatedAt: cursor?.[0],
      cursorId: cursor?.[1],
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          "Conversation message list fetched successfully",
        ),
      );
  }

  async create(req: CustomRequest<Message>, res: Response) {
    const { id: userId, email } = req.user as IUser;
    const body = req.body;

    this.logger.info({
      msg: "Message create attempt",
      userId,
      userEmail: email,
      conversationId: body.conversationId,
    });

    const message = await this.messageService.create(body);

    return res
      .status(201)
      .json(new ApiResponse(201, message, "Message created successfully"));
  }
}
