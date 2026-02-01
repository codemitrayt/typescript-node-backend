import { Router } from "express";

import { logger } from "../../logger";
import { asyncHandler } from "../../utils";
import { ConsignmentModel, DocumentModel } from "../../models";
import { ConsignmentController } from "../../controllers";
import { validate, verifyJWT } from "../../middleware";
import {
  consignmentParamIdValidator,
  createConsignmentValidator,
  updateConsignmentValidator,
} from "../../validators/consignment.validator";

import ConsignmentService from "../../services/app/consignment.service";
import DocumentService from "../../services/app/document.service";

const consignmentRoute = Router();

const consignmentService = new ConsignmentService(ConsignmentModel);
const documentService = new DocumentService(DocumentModel);
const consignmentController = new ConsignmentController(
  consignmentService,
  documentService,
  logger,
);

consignmentRoute.route("/:consignmentId/document").get(
  verifyJWT,
  consignmentParamIdValidator,
  validate,
  asyncHandler((req, res) => consignmentController.documentList(req, res)),
);

consignmentRoute
  .route("/:consignmentId")
  .get(
    verifyJWT,
    consignmentParamIdValidator,
    validate,
    asyncHandler((req, res) => consignmentController.get(req, res)),
  )
  .put(
    verifyJWT,
    updateConsignmentValidator,
    consignmentParamIdValidator,
    validate,
    asyncHandler((req, res) => consignmentController.update(req, res)),
  )
  .delete(
    verifyJWT,
    consignmentParamIdValidator,
    validate,
    asyncHandler((req, res) => consignmentController.delete(req, res)),
  );

consignmentRoute
  .route("/")
  .post(
    verifyJWT,
    createConsignmentValidator,
    validate,
    asyncHandler((req, res) => consignmentController.create(req, res)),
  )
  .get(
    verifyJWT,
    validate,
    asyncHandler((req, res) => consignmentController.list(req, res)),
  );

export { consignmentRoute };
