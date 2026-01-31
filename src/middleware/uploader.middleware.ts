import multer from "multer";

import { ENV } from "../config";

export const uploader = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: parseInt(ENV.FILE_SIZE) },
});
