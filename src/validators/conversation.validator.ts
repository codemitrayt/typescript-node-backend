import { body, param } from "express-validator";

const createNotEmptyMessage = (field: string) => `${field} is required`;

/* ---------------------------------------------------- */
/* FIELD VALIDATORS */
/* ---------------------------------------------------- */

const titleField = body("title")
  .trim()
  .notEmpty()
  .withMessage(createNotEmptyMessage("Conversation title"))
  .isLength({ min: 2 })
  .withMessage("Conversation title must be at least 2 characters long");

const modelField = body("model")
  .trim()
  .notEmpty()
  .withMessage(createNotEmptyMessage("Model"))
  .isString()
  .withMessage("Model must be a valid string");

const systemPromptField = body("systemPrompt")
  .optional()
  .trim()
  .isString()
  .withMessage("System prompt must be a string");

const taskTypeField = body("taskType")
  .optional()
  .trim()
  .isString()
  .withMessage("Task type must be a string");

const isPinnedField = body("isPinned")
  .optional()
  .isBoolean()
  .withMessage("isPinned must be a boolean");

const conversationIdParamsField = param("id")
  .trim()
  .notEmpty()
  .withMessage(createNotEmptyMessage("Conversation ID"))
  .isUUID()
  .withMessage("Invalid Conversation ID format");

const createConversationValidator = [
  titleField,
  modelField.optional(),
  systemPromptField,
  taskTypeField,
];

const updateConversationValidator = [
  conversationIdParamsField,

  body("title")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Conversation title must be at least 2 characters long"),

  body("model")
    .optional()
    .trim()
    .isString()
    .withMessage("Model must be a valid string"),

  body("systemPrompt")
    .optional()
    .trim()
    .isString()
    .withMessage("System prompt must be a string"),

  body("taskType")
    .optional()
    .trim()
    .isString()
    .withMessage("Task type must be a string"),

  isPinnedField,
];

const conversationIdParamsValidator = [conversationIdParamsField];

export {
  createConversationValidator,
  updateConversationValidator,
  conversationIdParamsValidator,
};
