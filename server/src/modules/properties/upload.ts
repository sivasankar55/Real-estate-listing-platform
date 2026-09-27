import multer from "multer";
import { AppError } from "../../utils/app-error.js";

const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (_request, file, callback) => {
    if (!acceptedTypes.has(file.mimetype)) {
      callback(new AppError(422, "INVALID_IMAGE_TYPE", "Images must be JPEG, PNG, or WebP."));
      return;
    }
    callback(null, true);
  }
});

