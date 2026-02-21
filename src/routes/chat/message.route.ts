import { Router } from "express";

import { logger } from "../../logger";
import { Message } from "../../entities";
import { asyncHandler } from "../../utils";
import { AppDataSource } from "../../config";
import { UserRole } from "../../types/user.types";
import { MessageController } from "../../controllers";
import { validate, verifyJWT, verifyPermission } from "../../middleware";
import { MessageService } from "../../services/chat/message.service";
import {
  createMessageValidator,
  messageListValidator,
} from "../../validators/message.validator";

const messageRouter: Router = Router();

const messageRepository = AppDataSource.getRepository(Message);
const messageService = new MessageService(messageRepository);
const messageController = new MessageController(messageService, logger);

messageRouter.post(
  "/",
  verifyJWT,
  verifyPermission([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER]),
  createMessageValidator,
  validate,
  asyncHandler((req, res) => messageController.create(req, res)),
);

messageRouter.get(
  "/",
  verifyJWT,
  verifyPermission([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER]),
  messageListValidator,
  validate,
  asyncHandler((req, res) => messageController.list(req, res)),
);

export { messageRouter };
