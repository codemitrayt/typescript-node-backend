import { Router } from "express";

import { logger } from "../../logger";
import { asyncHandler } from "../../utils";
import { AppDataSource } from "../../config";
import { Conversation } from "../../entities";
import { UserRole } from "../../types/user.types";
import { ConversationController } from "../../controllers";
import { validate, verifyJWT, verifyPermission } from "../../middleware";
import { ConversationService } from "../../services/chat/conversation.service";
import {
  createConversationValidator,
  updateConversationValidator,
  conversationIdParamsValidator,
} from "../../validators/conversation.validator";

const conversationRouter: Router = Router();
const conversationRepository = AppDataSource.getRepository(Conversation);
const conversationService = new ConversationService(conversationRepository);
const conversationController = new ConversationController(
  conversationService,
  logger,
);

conversationRouter.post(
  "/",
  verifyJWT,
  verifyPermission([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER]),
  createConversationValidator,
  validate,
  asyncHandler((req, res) => conversationController.create(req, res)),
);

conversationRouter.get(
  "/",
  verifyJWT,
  verifyPermission([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER]),
  asyncHandler((req, res) => conversationController.list(req, res)),
);

conversationRouter.get(
  "/:id",
  verifyJWT,
  verifyPermission([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER]),
  conversationIdParamsValidator,
  validate,
  asyncHandler((req, res) => conversationController.getById(req, res)),
);

conversationRouter.put(
  "/:id",
  verifyJWT,
  verifyPermission([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER]),
  conversationIdParamsValidator,
  updateConversationValidator,
  validate,
  asyncHandler((req, res) => conversationController.update(req, res)),
);

conversationRouter.delete(
  "/:id",
  verifyJWT,
  verifyPermission([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER]),
  conversationIdParamsValidator,
  validate,
  asyncHandler((req, res) => conversationController.delete(req, res)),
);

conversationRouter.patch(
  "/:id/toggle-pin",
  verifyJWT,
  verifyPermission([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER]),
  conversationIdParamsValidator,
  validate,
  asyncHandler((req, res) => conversationController.togglePin(req, res)),
);

export { conversationRouter };
