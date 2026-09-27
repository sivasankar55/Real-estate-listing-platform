import { prisma } from "../../db/prisma.js";
import { destroyImage, uploadImage } from "../../config/cloudinary.js";
import { AppError } from "../../utils/app-error.js";

const imageLimit = 5;

export async function upload(propertyId: string, files: Express.Multer.File[]) {
  if (!files.length) throw new AppError(422, "NO_IMAGES", "Choose at least one image to upload.");

  const imageCount = await prisma.propertyImage.count({ where: { propertyId } });
  if (imageCount + files.length > imageLimit) {
    throw new AppError(422, "IMAGE_LIMIT_EXCEEDED", `A property can have at most ${imageLimit} images.`);
  }

  const uploaded = await Promise.all(files.map((file) => uploadImage(file.buffer, propertyId)));
  return prisma.$transaction(uploaded.map((image, index) => prisma.propertyImage.create({
    data: {
      propertyId,
      url: image.url,
      publicId: image.publicId,
      isPrimary: imageCount === 0 && index === 0,
      sortOrder: imageCount + index
    }
  })));
}

export async function remove(propertyId: string, imageId: string) {
  const image = await prisma.propertyImage.findFirst({ where: { id: imageId, propertyId } });
  if (!image) throw new AppError(404, "IMAGE_NOT_FOUND", "Image not found.");

  await destroyImage(image.publicId);
  await prisma.propertyImage.delete({ where: { id: image.id } });

  if (image.isPrimary) {
    const replacement = await prisma.propertyImage.findFirst({
      where: { propertyId },
      orderBy: { sortOrder: "asc" }
    });
    if (replacement) await prisma.propertyImage.update({ where: { id: replacement.id }, data: { isPrimary: true } });
  }
}

export async function removeAll(propertyId: string) {
  const images = await prisma.propertyImage.findMany({ where: { propertyId }, select: { publicId: true } });
  await Promise.all(images.map((image) => destroyImage(image.publicId)));
}

