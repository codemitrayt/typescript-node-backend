import { body, param } from "express-validator";
import { AvailableUserRole } from "../constant";

const createNotEmptyMessage = (field: string) => `${field} is required`;

const emailField = body("email")
  .trim()
  .notEmpty()
  .withMessage(createNotEmptyMessage("Email"))
  .isEmail()
  .withMessage("Email is invalid");

const passwordField = body("password")
  .trim()
  .notEmpty()
  .withMessage(createNotEmptyMessage("Password"))
  .isLength({ min: 6 })
  .withMessage("Password must be at least 6 characters long");

const confirmPasswordField = body("confirmPassword")
  .trim()
  .notEmpty()
  .withMessage(createNotEmptyMessage("Confirm password"))
  .custom((value, { req }) => value === req.body.password)
  .withMessage("Passwords do not match");

const tokenField = body("token")
  .trim()
  .notEmpty()
  .withMessage(createNotEmptyMessage("Token"));

const nameField = body("fullName")
  .trim()
  .notEmpty()
  .withMessage(createNotEmptyMessage("Full Name"))
  .isLength({ min: 3 })
  .withMessage("Name must be at least 3 characters long");

const userIDParamsField = param("userId")
  .trim()
  .notEmpty()
  .withMessage(createNotEmptyMessage("User ID"))
  .isMongoId()
  .withMessage("Invalid User ID format");

const userRoleField = body("role")
  .trim()
  .notEmpty()
  .withMessage("User role is required")
  .isIn(AvailableUserRole)
  .withMessage("User role is invalid");

const registerValidator = [emailField, nameField, passwordField];

const passwordValidator = [passwordField, confirmPasswordField, tokenField];

const loginValidator = [emailField, passwordField];

const emailValidator = [emailField];

const tokenValidator = [tokenField];

const userIDParamsValidator = [userIDParamsField];

const createUserValidator = [
  emailField,
  nameField,
  passwordField,
  userRoleField,
];

export {
  registerValidator,
  passwordValidator,
  loginValidator,
  emailValidator,
  tokenValidator,
  userIDParamsValidator,
  createUserValidator,
};
