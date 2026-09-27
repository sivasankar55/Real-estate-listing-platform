import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.js";
import { AppError } from "../utils/app-error.js";

let configured = false;

function client() {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new AppError(503, "IMAGE_SERVICE_UNAVAILABLE", "Image uploads are not configured yet.");
  }

  if (!configured) {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET
    });
    configured = true;
  }

  return cloudinary;
}

export function uploadImage(buffer: Buffer, propertyId: string) {
  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    const stream = client().uploader.upload_stream(
      { folder: `real-estate/properties/${propertyId}`, resource_type: "image" },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Cloudinary upload failed."));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

export async function destroyImage(publicId: string) {
  await client().uploader.destroy(publicId, { resource_type: "image" });
}

