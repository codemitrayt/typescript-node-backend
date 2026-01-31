import { body, param, query } from "express-validator";

// Single file upload validator
export const uploadFileValidator = [
  body("folder")
    .optional()
    .isString()
    .withMessage("Folder must be a string")
    .trim(),
];

// Bulk upload validator
export const bulkUploadValidator = [
  body("folder")
    .optional()
    .isString()
    .withMessage("Folder must be a string")
    .trim(),
  body("concurrency")
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage("Concurrency must be an integer between 1 and 20"),
];

// Download URL validator
export const downloadUrlValidator = [
  param("fileName")
    .notEmpty()
    .withMessage("File name is required")
    .isString()
    .withMessage("File name must be a string")
    .trim(),
  query("expiresIn")
    .optional()
    .isInt({ min: 1, max: 10080 })
    .withMessage("ExpiresIn must be between 1 and 10080 minutes (1 week)"),
];

// Bulk download validator
export const bulkDownloadValidator = [
  body("fileNames")
    .isArray({ min: 1 })
    .withMessage("File names must be a non-empty array"),
  body("fileNames.*")
    .isString()
    .withMessage("Each file name must be a string")
    .trim()
    .notEmpty()
    .withMessage("File names cannot be empty"),
  body("expiresIn")
    .optional()
    .isInt({ min: 1, max: 10080 })
    .withMessage("ExpiresIn must be between 1 and 10080 minutes (1 week)"),
];

// Delete file validator
export const deleteFileValidator = [
  param("fileName")
    .notEmpty()
    .withMessage("File name is required")
    .isString()
    .withMessage("File name must be a string")
    .trim(),
];

// Bulk delete validator
export const bulkDeleteValidator = [
  body("fileNames")
    .isArray({ min: 1 })
    .withMessage("File names must be a non-empty array"),
  body("fileNames.*")
    .isString()
    .withMessage("Each file name must be a string")
    .trim()
    .notEmpty()
    .withMessage("File names cannot be empty"),
];

// File exists validator
export const fileExistsValidator = [
  param("fileName")
    .notEmpty()
    .withMessage("File name is required")
    .isString()
    .withMessage("File name must be a string")
    .trim(),
];

// Bulk file exists validator
export const bulkFileExistsValidator = [
  body("fileNames")
    .isArray({ min: 1 })
    .withMessage("File names must be a non-empty array"),
  body("fileNames.*")
    .isString()
    .withMessage("Each file name must be a string")
    .trim()
    .notEmpty()
    .withMessage("File names cannot be empty"),
];
