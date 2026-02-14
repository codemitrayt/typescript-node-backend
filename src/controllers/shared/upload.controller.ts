import { Logger } from "winston";
import { Response } from "express";

import { UploadService } from "../../services";
import {
  IBulkUploadResult,
  CustomRequest,
  IBulkSignedUrlResult,
} from "../../types/shared.types";
import { ENV } from "../../config";
import { User } from "../../entities";

export class UploadController {
  constructor(
    private uploadService: UploadService,
    private logger: Logger,
  ) {}

  async uploadSingleFile(req: CustomRequest, res: Response): Promise<void> {
    const { id: userId, email } = req.user as unknown as User;
    this.logger.info({ msg: "Upload single file", userId, email });

    const file = req.file;

    if (!file) {
      res.status(400).json({
        success: false,
        message: "No file provided",
      });
      return;
    }

    const fileMetadata = await this.uploadService.uploadFileToGCS(
      file,
      ENV.GCLOUD_FOLDER_NAME,
    );

    this.logger.info({
      msg: "File uploaded successfully",
      fileName: fileMetadata.fileName,
    });

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      data: fileMetadata,
    });
  }

  async bulkUploadSequential(req: CustomRequest, res: Response): Promise<void> {
    const { email } = req.user as unknown as User;
    this.logger.info({ msg: "Bulk upload sequential", email });

    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        message: "No files provided",
      });
      return;
    }

    const result: IBulkUploadResult =
      await this.uploadService.bulkUploadSequential(
        files,
        ENV.GCLOUD_FOLDER_NAME,
      );

    this.logger.info({
      msg: "Bulk upload completed (sequential)",
      successCount: result.successCount,
      failedCount: result.failedCount,
    });

    res.status(200).json({
      success: true,
      message: `Uploaded ${result.successCount} of ${result.totalFiles} files`,
      data: result,
    });
  }

  async bulkUploadParallel(req: CustomRequest, res: Response): Promise<void> {
    const { email } = req.user as unknown as User;
    this.logger.info({ msg: "Bulk upload parallel", email });

    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        message: "No files provided",
      });
      return;
    }

    const result: IBulkUploadResult =
      await this.uploadService.bulkUploadParallel(
        files,
        ENV.GCLOUD_FOLDER_NAME,
      );

    this.logger.info({
      msg: "Bulk upload completed (parallel)",
      successCount: result.successCount,
      failedCount: result.failedCount,
    });

    res.status(200).json({
      success: true,
      message: `Uploaded ${result.successCount} of ${result.totalFiles} files`,
      data: result,
    });
  }

  async bulkUploadWithConcurrency(
    req: CustomRequest<{ concurrency: string }>,
    res: Response,
  ): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        res.status(400).json({
          success: false,
          message: "No files provided",
        });
        return;
      }

      const concurrency = parseInt(req.body.concurrency) || 5;

      const result: IBulkUploadResult =
        await this.uploadService.bulkUploadWithConcurrency(
          files,
          ENV.GCLOUD_FOLDER_NAME,
          concurrency,
        );

      this.logger.info({
        msg: "Bulk upload completed (with concurrency)",
        successCount: result.successCount,
        failedCount: result.failedCount,
        concurrency,
      });

      res.status(200).json({
        success: true,
        message: `Uploaded ${result.successCount} of ${result.totalFiles} files`,
        data: result,
      });
    } catch (error) {
      this.logger.error({ msg: "Bulk upload with concurrency error:", error });
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getDownloadUrl(req: CustomRequest, res: Response): Promise<void> {
    const { fileName } = req.params as { fileName: string };
    const expiresIn = parseInt(req.query.expiresIn as string) || 60;

    if (!fileName) {
      res.status(400).json({
        success: false,
        message: "File name is required",
      });
      return;
    }

    // Check if file exists
    const exists = await this.uploadService.fileExists(fileName);
    if (!exists) {
      res.status(404).json({
        success: false,
        message: "File not found",
      });
      return;
    }

    const downloadUrl = await this.uploadService.getSignedDownloadUrl(
      fileName,
      expiresIn,
    );

    res.status(200).json({
      success: true,
      data: {
        fileName,
        downloadUrl,
        expiresIn,
      },
    });
  }

  async downloadFile(req: CustomRequest, res: Response): Promise<void> {
    const { fileName } = req.params as { fileName: string };
    const expiresIn = parseInt(req.query.expiresIn as string) || 60;

    if (!fileName) {
      res.status(400).json({
        success: false,
        message: "File name is required",
      });
      return;
    }

    // Check if file exists
    const exists = await this.uploadService.fileExists(fileName);
    if (!exists) {
      res.status(404).json({
        success: false,
        message: "File not found",
      });
      return;
    }

    const downloadUrl = await this.uploadService.getSignedDownloadUrl(
      fileName,
      expiresIn,
    );

    // Redirect to signed URL
    res.redirect(downloadUrl);
  }

  async getViewUrl(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { fileName } = req.params as { fileName: string };
      const expiresIn = parseInt(req.query.expiresIn as string) || 60;

      if (!fileName) {
        res.status(400).json({
          success: false,
          message: "File name is required",
        });
        return;
      }

      // Check if file exists
      const exists = await this.uploadService.fileExists(fileName);
      if (!exists) {
        res.status(404).json({
          success: false,
          message: "File not found",
        });
        return;
      }

      const viewUrl = await this.uploadService.getSignedViewUrl(
        fileName,
        expiresIn,
      );

      res.status(200).json({
        success: true,
        data: {
          fileName,
          viewUrl,
          expiresIn,
        },
      });
    } catch (error) {
      this.logger.error({ msg: "Get view URL error:", error });
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async viewFile(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { fileName } = req.params as { fileName: string };
      const expiresIn = parseInt(req.query.expiresIn as string) || 60;

      if (!fileName) {
        res.status(400).json({
          success: false,
          message: "File name is required",
        });
        return;
      }

      // Check if file exists
      const exists = await this.uploadService.fileExists(fileName);
      if (!exists) {
        res.status(404).json({
          success: false,
          message: "File not found",
        });
        return;
      }

      const viewUrl = await this.uploadService.getSignedViewUrl(
        fileName,
        expiresIn,
      );

      // Redirect to signed URL
      res.redirect(viewUrl);
    } catch (error) {
      this.logger.error({ msg: "View file error:", error });
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async deleteFile(req: CustomRequest, res: Response): Promise<void> {
    const { fileName } = req.params as { fileName: string };

    if (!fileName) {
      res.status(400).json({
        success: false,
        message: "File name is required",
      });
      return;
    }

    // Check if file exists
    const exists = await this.uploadService.fileExists(fileName);
    if (!exists) {
      res.status(404).json({
        success: false,
        message: "File not found",
      });
      return;
    }

    await this.uploadService.deleteFileFromGCS(fileName);

    this.logger.info({
      msg: "File deleted successfully",
      fileName,
    });

    res.status(200).json({
      success: true,
      message: "File deleted successfully",
      data: {
        fileName,
      },
    });
  }

  async getBulkViewUrls(
    req: CustomRequest<{ fileNames: string[]; expiresIn: number }>,
    res: Response,
  ): Promise<void> {
    const { fileNames, expiresIn } = req.body;

    if (!fileNames || !Array.isArray(fileNames) || fileNames.length === 0) {
      res.status(400).json({
        success: false,
        message: "File names array is required",
      });
      return;
    }

    const urls: IBulkSignedUrlResult[] =
      await this.uploadService.getBulkSignedViewUrls(
        fileNames,
        expiresIn || 60,
      );

    const successUrls = urls.filter((url) => !url.error);
    const failedUrls = urls.filter((url) => url.error);

    res.status(200).json({
      success: true,
      message: `Generated ${successUrls.length} of ${urls.length} view URLs`,
      data: {
        urls,
        successCount: successUrls.length,
        failedCount: failedUrls.length,
      },
    });
  }
}
