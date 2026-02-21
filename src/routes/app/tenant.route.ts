import { Router } from "express";

import { logger } from "../../logger";
import { Tenant } from "../../models";
import { asyncHandler } from "../../utils";
import { UserRole } from "../../types/user.types";
import { TenantController } from "../../controllers";
import { TenantService } from "../../services/app/tenant.service";
import { validate, verifyJWT, verifyPermission } from "../../middleware";

import {
  createTenantValidator,
  updateTenantValidator,
  tenantIdParamsValidator,
} from "../../validators/tenant.validator";

const tenantRouter: Router = Router();
const tenantService = new TenantService(Tenant);
const tenantController = new TenantController(tenantService, logger);

tenantRouter.post(
  "/",
  verifyJWT,
  verifyPermission([UserRole.SUPER_ADMIN]),
  createTenantValidator,
  validate,
  asyncHandler((req, res) => tenantController.create(req, res)),
);

tenantRouter.get(
  "/",
  verifyJWT,
  verifyPermission([UserRole.SUPER_ADMIN]),
  asyncHandler((req, res) => tenantController.list(req, res)),
);

tenantRouter.get(
  "/:id",
  verifyJWT,
  verifyPermission([UserRole.SUPER_ADMIN, UserRole.ADMIN]),
  tenantIdParamsValidator,
  validate,
  asyncHandler((req, res) => tenantController.getById(req, res)),
);

tenantRouter.put(
  "/:id",
  verifyJWT,
  verifyPermission([UserRole.SUPER_ADMIN, UserRole.ADMIN]),
  tenantIdParamsValidator,
  updateTenantValidator,
  validate,
  asyncHandler((req, res) => tenantController.update(req, res)),
);

tenantRouter.delete(
  "/:id",
  verifyJWT,
  verifyPermission([UserRole.SUPER_ADMIN]),
  tenantIdParamsValidator,
  validate,
  asyncHandler((req, res) => tenantController.delete(req, res)),
);

export { tenantRouter };
