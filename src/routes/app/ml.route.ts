import { Router } from "express";

import { logger } from "../../logger";
import { asyncHandler } from "../../utils";
import { MLController } from "../../controllers";
import { verifyJWT } from "../../middleware";

const mlRouter: Router = Router();
const mlController = new MLController(logger);

mlRouter.post(
  "/chat-response",
  verifyJWT,
  asyncHandler((req, res) => mlController.getChatResponse(req, res)),
);

export { mlRouter };
