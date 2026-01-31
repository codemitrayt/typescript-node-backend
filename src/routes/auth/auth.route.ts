import { Router, Request, Response } from "express";

import UserService from "../../services/app/user.service";
import TokenService from "../../services/shared/token.service";
import HashService from "../../services/shared/hash.service";

import { logger } from "../../logger";
import { UserModel } from "../../models";
import { asyncHandler } from "../../utils";
import { ENV, passport } from "../../config";
import { UserRole } from "../../types/user.types";
import { AuthController } from "../../controllers";
import { validate, verifyJWT, verifyPermission } from "../../middleware";
import {
  createUserValidator,
  loginValidator,
  registerValidator,
} from "../../validators/user.validator";

const authRouter: Router = Router();

// Service instances
const hasService = new HashService();
const tokenService = new TokenService();
const userService = new UserService(UserModel);
const authController = new AuthController(
  userService,
  tokenService,
  hasService,
  logger,
);

// Google OAuth routes
authRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    logger.info({ msg: "Google user authenticated", user });
    return res.redirect(ENV.FRONTEND_URL);
  }),
);

authRouter.post(
  "/register",
  verifyJWT,
  verifyPermission([UserRole.ADMIN]),
  registerValidator,
  validate,
  asyncHandler((req, res) => authController.register(req, res)),
);

authRouter.post(
  "/login",
  loginValidator,
  validate,
  asyncHandler((req, res) => authController.login(req, res)),
);

authRouter.route("/").post(
  verifyJWT,
  verifyPermission([UserRole.ADMIN]),
  createUserValidator,
  validate,
  asyncHandler((req, res) => authController.create(req, res)),
);

export { authRouter };
