import { Router } from "express";

import { logger } from "../../logger";
import { asyncHandler } from "../../utils";
import { UserRole } from "../../types/user.types";
import { UploadController } from "../../controllers";
import {
  verifyJWT,
  verifyPermission,
  validate,
  uploader,
} from "../../middleware";
import {
  uploadFileValidator,
  bulkUploadValidator,
  downloadUrlValidator,
  deleteFileValidator,
} from "../../validators/upload.validator";

import { UploadService } from "../../services/shared/upload.service";

const uploadRouter: Router = Router();

// Service instances
const uploadService = new UploadService();
const uploadController = new UploadController(uploadService, logger);

// Single file upload - All authenticated users can upload
uploadRouter.post(
  "/",
  verifyJWT,
  uploader.single("file"),
  uploadFileValidator,
  validate,
  asyncHandler((req, res) => uploadController.uploadSingleFile(req, res)),
);

// Bulk file uploads - Sequential
uploadRouter.post(
  "/bulk/sequential",
  verifyJWT,
  uploader.array("files", 50),
  bulkUploadValidator,
  validate,
  asyncHandler((req, res) => uploadController.bulkUploadSequential(req, res)),
);

// Bulk file uploads - Parallel
uploadRouter.post(
  "/bulk/parallel",
  verifyJWT,
  uploader.array("files", 50),
  bulkUploadValidator,
  validate,
  asyncHandler((req, res) => uploadController.bulkUploadParallel(req, res)),
);

// Bulk file uploads - With Concurrency (Recommended)
uploadRouter.post(
  "/bulk/concurrency",
  verifyJWT,
  uploader.array("files", 100),
  bulkUploadValidator,
  validate,
  asyncHandler((req, res) =>
    uploadController.bulkUploadWithConcurrency(req, res),
  ),
);

// Get download URL for a single file
uploadRouter.get(
  "/download/:fileName",
  verifyJWT,
  downloadUrlValidator,
  validate,
  asyncHandler((req, res) => uploadController.getDownloadUrl(req, res)),
);

// Direct download file (redirect)
uploadRouter.get(
  "/download/file/:fileName",
  verifyJWT,
  downloadUrlValidator,
  validate,
  asyncHandler((req, res) => uploadController.downloadFile(req, res)),
);

uploadRouter.get(
  "/view/bulk",
  verifyJWT,
  asyncHandler((req, res) => uploadController.getBulkViewUrls(req, res)),
);

// Get view URL for a single file
uploadRouter.get(
  "/view/:fileName",
  verifyJWT,
  downloadUrlValidator,
  validate,
  asyncHandler((req, res) => uploadController.getViewUrl(req, res)),
);

// Direct view file in browser (redirect)
uploadRouter.get(
  "/view/file/:fileName",
  verifyJWT,
  downloadUrlValidator,
  validate,
  asyncHandler((req, res) => uploadController.viewFile(req, res)),
);

// Delete a single file - Admin only
uploadRouter.delete(
  "/:fileName",
  verifyJWT,
  verifyPermission([UserRole.ADMIN]),
  deleteFileValidator,
  validate,
  asyncHandler((req, res) => uploadController.deleteFile(req, res)),
);

export { uploadRouter };
