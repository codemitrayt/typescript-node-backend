import { body, param } from "express-validator";

const createNotEmptyMessage = (field: string) => `${field} is required`;

/* ---------------------------------------------------- */
/* FIELD VALIDATORS */
/* ---------------------------------------------------- */

const nameField = body("name")
  .trim()
  .notEmpty()
  .withMessage(createNotEmptyMessage("Tenant name"))
  .isLength({ min: 2 })
  .withMessage("Tenant name must be at least 2 characters long");

const emailField = body("email")
  .trim()
  .notEmpty()
  .withMessage(createNotEmptyMessage("Email"))
  .isEmail()
  .withMessage("Email is invalid");

const domainField = body("domain")
  .trim()
  .notEmpty()
  .withMessage(createNotEmptyMessage("Domain"))
  .matches(/^[a-zA-Z0-9]+([-.][a-zA-Z0-9]+)*(\.[a-zA-Z]{2,})+$/)
  .withMessage("Domain must be a valid domain format");

const websiteUrlField = body("websiteUrl")
  .trim()
  .notEmpty()
  .withMessage(createNotEmptyMessage("Website URL"))
  .isURL()
  .withMessage("Website URL must be valid");

const tenantIdParamsField = param("id")
  .trim()
  .notEmpty()
  .withMessage(createNotEmptyMessage("Tenant ID"))
  .isUUID()
  .withMessage("Invalid Tenant ID format");

/* ---------------------------------------------------- */
/* CREATE VALIDATOR */
/* ---------------------------------------------------- */

const createTenantValidator = [
  nameField,
  emailField,
  domainField,
  websiteUrlField,
];

/* ---------------------------------------------------- */
/* UPDATE VALIDATOR */
/* (All fields optional but validated if present) */
/* ---------------------------------------------------- */

const updateTenantValidator = [
  tenantIdParamsField,

  body("name")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Tenant name must be at least 2 characters long"),

  body("email").optional().trim().isEmail().withMessage("Email is invalid"),

  body("domain")
    .optional()
    .trim()
    .matches(/^[a-zA-Z0-9]+([-.][a-zA-Z0-9]+)*(\.[a-zA-Z]{2,})+$/)
    .withMessage("Domain must be a valid domain format"),

  body("websiteUrl")
    .optional()
    .trim()
    .isURL()
    .withMessage("Website URL must be valid"),
];

/* ---------------------------------------------------- */
/* PARAM VALIDATOR */
/* ---------------------------------------------------- */

const tenantIdParamsValidator = [tenantIdParamsField];

/* ---------------------------------------------------- */
/* EXPORTS */
/* ---------------------------------------------------- */

export {
  createTenantValidator,
  updateTenantValidator,
  tenantIdParamsValidator,
};
