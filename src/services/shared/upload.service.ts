import { v4 } from "uuid";
import { Storage, Bucket, File } from "@google-cloud/storage";

import { ENV } from "../../config";
import { logger } from "../../logger";
import {
  IFileMetadata,
  IMulterFile,
  IBulkUploadResult,
  IUploadResult,
  IBulkDeleteResult,
  IBulkSignedUrlResult,
} from "../../types/shared.types";

class UploadService {
  private storage: Storage;
  private bucket: Bucket;

  constructor() {
    const serviceAccount: { client_email: string; private_key: string } =
      JSON.parse(ENV.GCS_SERVICE_ACCOUNT);
    this.storage = new Storage({
      projectId: ENV.GCLOUD_PROJECT_ID,
      credentials: {
        client_email: serviceAccount.client_email,
        private_key: serviceAccount.private_key.replace(/\\n/g, "\n"),
      },
    });
    this.bucket = this.storage.bucket(ENV.GCLOUD_BUCKET_NAME);
  }

  /**
   * Upload file to GCS with public access
   * @param {IMulterFile} file - Multer file object
   * @param {string} folder - Optional folder path in bucket
   * @returns {Promise<{fileName: string; publicUrl: string}>} - File name and public URL
   */
  async uploadFileToGCSPublic(
    file: IMulterFile,
    folder: string = "",
  ): Promise<{ fileName: string; publicUrl: string }> {
    try {
      if (!file || !file.buffer) {
        throw new Error("Invalid file: file or buffer missing");
      }

      const fileName: string = folder
        ? `${folder}/${Date.now()}_${file.originalname}`
        : `${Date.now()}_${file.originalname}`;

      const blob: File = this.bucket.file(fileName);
      const blobStream = blob.createWriteStream({
        resumable: false,
        contentType: file.mimetype,
      });

      return new Promise<{ fileName: string; publicUrl: string }>(
        (resolve, reject) => {
          blobStream.on("error", (err: Error) => {
            logger.error({ msg: "GCS Upload Error:", err });
            reject(new Error("Failed to upload to GCS"));
          });

          blobStream.on("finish", async () => {
            try {
              await blob.makePublic();
              const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${blob.name}`;
              resolve({ fileName, publicUrl });
            } catch (err) {
              logger.error({ msg: "Make Public Error:", err });
              reject(
                new Error("Upload succeeded but failed to make file public"),
              );
            }
          });

          blobStream.end(file.buffer);
        },
      );
    } catch (error) {
      logger.error({ msg: "Unexpected GCS Upload Error:", error });
      throw new Error("Unexpected error during GCS upload");
    }
  }

  /**
   * Upload file to GCS with private access
   * @param {IMulterFile} file - Multer file object
   * @param {string} folder - Optional folder path in bucket
   * @returns {Promise<IFileMetadata>} - Object containing file metadata
   */
  async uploadFileToGCS(
    file: IMulterFile,
    folder: string = "",
  ): Promise<IFileMetadata> {
    try {
      if (!file || !file.buffer) {
        throw new Error("Invalid file: file or buffer missing");
      }

      const fileName: string = folder
        ? `${folder}/${v4()}_${file.originalname}`
        : `${v4()}_${file.originalname}`;

      const blob: File = this.bucket.file(fileName);
      const blobStream = blob.createWriteStream({
        resumable: false,
        contentType: file.mimetype,
        metadata: {
          contentDisposition: `attachment; filename="${file.originalname}"`,
        },
      });

      return new Promise<IFileMetadata>((resolve, reject) => {
        blobStream.on("error", (err: Error) => {
          logger.error("GCS Upload Error:", err);
          reject(new Error("Failed to upload to GCS"));
        });

        blobStream.on("finish", async () => {
          try {
            // File is private by default, no need to make it public
            const fileMetadata: IFileMetadata = {
              fileName: blob.name,
              originalName: file.originalname,
              contentType: file.mimetype,
              size: file.size,
              bucket: this.bucket.name,
            };

            resolve(fileMetadata);
          } catch (err) {
            logger.error({ msg: "Metadata Error:", err });
            reject(
              new Error("Upload succeeded but failed to retrieve metadata"),
            );
          }
        });

        blobStream.end(file.buffer);
      });
    } catch (error) {
      logger.error({ msg: "Unexpected GCS Upload Error:", error });
      throw new Error("Unexpected error during GCS upload");
    }
  }

  /**
   * Upload a single file with error handling (used internally for bulk uploads)
   * @param {IMulterFile} file - Multer file object
   * @param {string} folder - Optional folder path in bucket
   * @returns {Promise<IUploadResult>} - Upload result with success/failure info
   */
  private async uploadSingleFile(
    file: IMulterFile,
    folder: string = "",
  ): Promise<IUploadResult> {
    try {
      const fileMetadata = await this.uploadFileToGCS(file, folder);
      return {
        success: true,
        data: fileMetadata,
        originalName: file.originalname,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        originalName: file.originalname,
      };
    }
  }

  /**
   * Upload multiple files to GCS with private access (Sequential)
   * @param {IMulterFile[]} files - Array of Multer file objects
   * @param {string} folder - Optional folder path in bucket
   * @returns {Promise<IBulkUploadResult>} - Results of all uploads
   */
  async bulkUploadSequential(
    files: IMulterFile[],
    folder: string = "",
  ): Promise<IBulkUploadResult> {
    const results: IUploadResult[] = [];

    for (const file of files) {
      const result = await this.uploadSingleFile(file, folder);
      results.push(result);
    }

    return this.processBulkResults(results);
  }

  /**
   * Upload multiple files to GCS with private access (Parallel)
   * @param {IMulterFile[]} files - Array of Multer file objects
   * @param {string} folder - Optional folder path in bucket
   * @returns {Promise<IBulkUploadResult>} - Results of all uploads
   */
  async bulkUploadParallel(
    files: IMulterFile[],
    folder: string = "",
  ): Promise<IBulkUploadResult> {
    const uploadPromises = files.map((file) =>
      this.uploadSingleFile(file, folder),
    );

    const results = await Promise.all(uploadPromises);

    return this.processBulkResults(results);
  }

  /**
   * Upload multiple files with concurrency limit (Recommended for large batches)
   * @param {IMulterFile[]} files - Array of Multer file objects
   * @param {string} folder - Optional folder path in bucket
   * @param {number} concurrency - Maximum number of concurrent uploads (default: 5)
   * @returns {Promise<IBulkUploadResult>} - Results of all uploads
   */
  async bulkUploadWithConcurrency(
    files: IMulterFile[],
    folder: string = "",
    concurrency: number = 5,
  ): Promise<IBulkUploadResult> {
    const results: IUploadResult[] = [];
    const batches: IMulterFile[][] = [];

    // Split files into batches
    for (let i = 0; i < files.length; i += concurrency) {
      batches.push(files.slice(i, i + concurrency));
    }

    // Process each batch
    for (const batch of batches) {
      const batchPromises = batch.map((file) =>
        this.uploadSingleFile(file, folder),
      );
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return this.processBulkResults(results);
  }

  /**
   * Process bulk upload results and format response
   * @param {IUploadResult[]} results - Array of upload results
   * @returns {IBulkUploadResult} - Formatted bulk upload result
   */
  private processBulkResults(results: IUploadResult[]): IBulkUploadResult {
    const success: IFileMetadata[] = [];
    const failed: { originalName: string; error: string }[] = [];

    results.forEach((result) => {
      if (result.success && result.data) {
        success.push(result.data);
      } else {
        failed.push({
          originalName: result.originalName,
          error: result.error || "Unknown error",
        });
      }
    });

    return {
      success,
      failed,
      totalFiles: results.length,
      successCount: success.length,
      failedCount: failed.length,
    };
  }

  /**
   * Generate a signed URL for downloading a private file
   * @param {string} fileName - The file name in GCS
   * @param {number} expiresIn - Expiration time in minutes (default: 60)
   * @returns {Promise<string>} - Signed URL
   */
  async getSignedDownloadUrl(
    fileName: string,
    expiresIn: number = 60,
  ): Promise<string> {
    try {
      const file: File = this.bucket.file(fileName);

      const [url] = await file.getSignedUrl({
        version: "v4",
        action: "read",
        expires: Date.now() + expiresIn * 60 * 1000,
        responseDisposition: `attachment`,
      });

      return url;
    } catch (error) {
      logger.error({ msg: "Signed URL Generation Error:", error });
      throw new Error("Failed to generate signed URL");
    }
  }

  /**
   * Generate signed URLs for multiple files
   * @param {string[]} fileNames - Array of file names in GCS
   * @param {number} expiresIn - Expiration time in minutes (default: 60)
   * @returns {Promise<IBulkSignedUrlResult[]>} - Array of signed URLs
   */
  async getBulkSignedDownloadUrls(
    fileNames: string[],
    expiresIn: number = 60,
  ): Promise<IBulkSignedUrlResult[]> {
    const urlPromises = fileNames.map(async (fileName) => {
      try {
        const url = await this.getSignedDownloadUrl(fileName, expiresIn);
        return { fileName, url };
      } catch (error) {
        return {
          fileName,
          url: "",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    });

    return await Promise.all(urlPromises);
  }

  /**
   * Generate a signed URL for viewing a file (without forcing download)
   * @param {string} fileName - The file name in GCS
   * @param {number} expiresIn - Expiration time in minutes (default: 60)
   * @returns {Promise<string>} - Signed URL
   */
  async getSignedViewUrl(
    fileName: string,
    expiresIn: number = 60,
  ): Promise<string> {
    try {
      const file: File = this.bucket.file(fileName);

      const [url] = await file.getSignedUrl({
        version: "v4",
        action: "read",
        expires: Date.now() + expiresIn * 60 * 1000,
        responseDisposition: `inline`, // Display in browser
      });

      return url;
    } catch (error) {
      logger.error({ msg: "Signed URL Generation Error:", error });
      throw new Error("Failed to generate signed URL");
    }
  }

  /**
   * Generate signed URLs for viewing multiple files
   * @param {string[]} fileNames - Array of file names in GCS
   * @param {number} expiresIn - Expiration time in minutes (default: 60)
   * @returns {Promise<IBulkSignedUrlResult[]>} - Array of signed URLs
   */
  async getBulkSignedViewUrls(
    fileNames: string[],
    expiresIn: number = 60,
  ): Promise<IBulkSignedUrlResult[]> {
    const urlPromises = fileNames.map(async (fileName) => {
      try {
        const url = await this.getSignedViewUrl(fileName, expiresIn);
        return { fileName, url };
      } catch (error) {
        return {
          fileName,
          url: "",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    });

    return await Promise.all(urlPromises);
  }

  /**
   * Delete a file from GCS
   * @param {string} fileName - The file name in GCS
   * @returns {Promise<boolean>} - Success status
   */
  async deleteFileFromGCS(fileName: string): Promise<boolean> {
    try {
      const file: File = this.bucket.file(fileName);
      await file.delete();
      return true;
    } catch (error) {
      logger.error({ msg: "GCS Delete Error:", error });
      throw new Error("Failed to delete file from GCS");
    }
  }

  /**
   * Delete multiple files from GCS
   * @param {string[]} fileNames - Array of file names in GCS
   * @returns {Promise<IBulkDeleteResult>} - Results of bulk delete operation
   */
  async bulkDeleteFiles(fileNames: string[]): Promise<IBulkDeleteResult> {
    const success: string[] = [];
    const failed: { fileName: string; error: string }[] = [];

    const deletePromises = fileNames.map(async (fileName) => {
      try {
        await this.deleteFileFromGCS(fileName);
        success.push(fileName);
      } catch (error) {
        failed.push({
          fileName,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    await Promise.all(deletePromises);

    return { success, failed };
  }

  /**
   * Check if file exists in GCS
   * @param {string} fileName - The file name in GCS
   * @returns {Promise<boolean>} - Existence status
   */
  async fileExists(fileName: string): Promise<boolean> {
    try {
      const file: File = this.bucket.file(fileName);
      const [exists] = await file.exists();
      return exists;
    } catch (error) {
      logger.error({ msg: "File Existence Check Error:", error });
      return false;
    }
  }

  /**
   * Check if multiple files exist in GCS
   * @param {string[]} fileNames - Array of file names in GCS
   * @returns {Promise<{fileName: string; exists: boolean}[]>} - Existence status for each file
   */
  async bulkFileExists(
    fileNames: string[],
  ): Promise<{ fileName: string; exists: boolean }[]> {
    const existsPromises = fileNames.map(async (fileName) => {
      const exists = await this.fileExists(fileName);
      return { fileName, exists };
    });

    return await Promise.all(existsPromises);
  }
}

export default UploadService;
