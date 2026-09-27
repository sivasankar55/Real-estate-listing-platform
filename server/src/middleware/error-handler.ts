import type { ErrorRequestHandler, RequestHandler } from "express";
import { Prisma } from "@prisma/client";
import multer from "multer";
import { AppError } from "../utils/app-error.js";

export const notFound: RequestHandler = (request, _response, next) => {
  next(new AppError(404, "NOT_FOUND", `Route ${request.method} ${request.path} was not found.`));
};

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({
      error: { code: error.code, message: error.message, details: error.details }
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return response.status(409).json({
      error: { code: "CONFLICT", message: "That record already exists." }
    });
  }

  if (error instanceof multer.MulterError) {
    const isLimit = error.code === "LIMIT_FILE_SIZE" || error.code === "LIMIT_FILE_COUNT";
    return response.status(isLimit ? 413 : 422).json({
      error: {
        code: isLimit ? "UPLOAD_LIMIT_EXCEEDED" : "INVALID_UPLOAD",
        message: isLimit
          ? "The upload exceeds the allowed size or file-count limit."
          : "The uploaded files are invalid."
      }
    });
  }

  const httpError = error as { status?: number; type?: string };
  if (httpError.type === "entity.parse.failed") {
    return response.status(400).json({
      error: { code: "INVALID_JSON", message: "Request body must contain valid JSON." }
    });
  }
  if (httpError.status === 413) {
    return response.status(413).json({
      error: { code: "PAYLOAD_TOO_LARGE", message: "Request body is too large." }
    });
  }

  console.error(error);
  return response.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Something went wrong." }
  });
};
