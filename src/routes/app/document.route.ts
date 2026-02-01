import { Router } from "express";

import { logger } from "../../logger";
import { asyncHandler } from "../../utils";
import { DocumentModel } from "../../models";
import { DocumentController } from "../../controllers";
import { validate, verifyJWT } from "../../middleware";

import DocumentService from "../../services/app/document.service";

const documentRoute = Router();

const documentService = new DocumentService(DocumentModel);
const documentController = new DocumentController(documentService, logger);

documentRoute
  .route("/")
  .post(
    verifyJWT,
    validate,
    asyncHandler((req, res) => documentController.create(req, res)),
  )
  .get(
    verifyJWT,
    validate,
    asyncHandler((req, res) => documentController.list(req, res)),
  );

documentRoute
  .route("/:documentId")
  .get(
    verifyJWT,
    validate,
    asyncHandler((req, res) => documentController.get(req, res)),
  )
  .put(
    verifyJWT,
    validate,
    asyncHandler((req, res) => documentController.update(req, res)),
  )
  .delete(
    verifyJWT,
    validate,
    asyncHandler((req, res) => documentController.delete(req, res)),
  );

export { documentRoute };
