import { body, param, ValidationChain } from "express-validator";
import { ObjectId } from "mongodb";

/**
 * Validator for creating a new consignment
 */
export const createConsignmentValidator: ValidationChain[] = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isString()
    .withMessage("Title must be a string")
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters"),

  body("invoiceNumberRange")
    .notEmpty()
    .withMessage("Invoice number range is required")
    .isArray({ min: 1 })
    .withMessage("Invoice number range must be a non-empty array")
    .custom((value: string[]) => {
      if (!value.every((item) => typeof item === "string")) {
        throw new Error("All invoice numbers must be strings");
      }
      return true;
    }),

  body("brandName")
    .trim()
    .notEmpty()
    .withMessage("Brand name is required")
    .isString()
    .withMessage("Brand name must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("Brand name must be between 2 and 100 characters"),

  body("portOfIssue")
    .trim()
    .notEmpty()
    .withMessage("Port or issue is required")
    .isString()
    .withMessage("Port or issue must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("Port or issue must be between 2 and 100 characters"),

  body("currency")
    .trim()
    .notEmpty()
    .withMessage("Currency is required")
    .isString()
    .withMessage("Currency must be a string")
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency must be a 3-letter code (e.g., USD, EUR, GBP)")
    .isUppercase()
    .withMessage("Currency code must be uppercase")
    .matches(/^[A-Z]{3}$/)
    .withMessage("Currency must be a valid 3-letter ISO code"),
];

/**
 * Validator for updating an existing consignment
 */
export const updateConsignmentValidator: ValidationChain[] = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty")
    .isString()
    .withMessage("Title must be a string")
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters"),

  body("invoiceNumberRange")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Invoice number range must be a non-empty array")
    .custom((value: string[]) => {
      if (!value.every((item) => typeof item === "string")) {
        throw new Error("All invoice numbers must be strings");
      }
      return true;
    }),

  body("brandName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Brand name cannot be empty")
    .isString()
    .withMessage("Brand name must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("Brand name must be between 2 and 100 characters"),

  body("portOfIssue")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Port or issue cannot be empty")
    .isString()
    .withMessage("Port or issue must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("Port or issue must be between 2 and 100 characters"),

  body("currency")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Currency cannot be empty")
    .isString()
    .withMessage("Currency must be a string")
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency must be a 3-letter code (e.g., USD, EUR, GBP)")
    .isUppercase()
    .withMessage("Currency code must be uppercase")
    .matches(/^[A-Z]{3}$/)
    .withMessage("Currency must be a valid 3-letter ISO code"),
];

/**
 * Validator for consignment ID parameter in routes
 */
export const consignmentParamIdValidator: ValidationChain[] = [
  param("consignmentId")
    .trim()
    .notEmpty()
    .withMessage("Consignment ID is required")
    .custom((value: string) => {
      if (!ObjectId.isValid(value)) {
        throw new Error("Invalid consignment ID format");
      }
      return true;
    }),
];
