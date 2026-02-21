import { body, query } from "express-validator";
import { MessageRole, MessageStatus } from "../types/message.types";

export const createMessageValidator = [
  body("conversationId")
    .exists({ checkFalsy: true })
    .withMessage("conversationId is required")
    .isMongoId()
    .withMessage("conversationId must be a valid ID"),

  body("role")
    .exists()
    .withMessage("role is required")
    .isIn(Object.values(MessageRole))
    .withMessage("Invalid message role"),

  body("content")
    .exists({ checkFalsy: true })
    .withMessage("content is required")
    .isString()
    .withMessage("content must be a string"),

  body("parentMessageId")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("parentMessageId must be a valid UUID"),

  body("tokenCount")
    .optional()
    .isInt({ min: 0 })
    .withMessage("tokenCount must be a non-negative integer"),

  body("cost")
    .optional()
    .isInt({ min: 0 })
    .withMessage("cost must be a non-negative integer"),

  body("model")
    .optional({ nullable: true })
    .isString()
    .withMessage("model must be a string"),

  body("generatedIds")
    .optional()
    .isArray()
    .withMessage("generatedIds must be an array"),

  body("generatedIds.*")
    .optional()
    .isString()
    .withMessage("Each generatedId must be a string"),

  body("status")
    .optional()
    .isIn(Object.values(MessageStatus))
    .withMessage("Invalid message status"),

  body("metadata")
    .optional({ nullable: true })
    .isObject()
    .withMessage("metadata must be a JSON object"),
];

export const messageListValidator = [
  query("conversationId")
    .exists({ checkFalsy: true })
    .withMessage("conversationId is required")
    .isMongoId()
    .withMessage("conversationId must be a valid ID"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be between 1 and 100"),

  query("page")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be between 1 and 100"),
];
