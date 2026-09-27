"use client";

import Image from "next/image";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { revalidateProperty } from "@/lib/revalidate";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const imageLimit = 5;

type PropertyImage = { id: string; url: string; isPrimary: boolean };

async function fetchImages(slug: string) {
  const response = await fetch(
    `${apiUrl}/api/properties/${encodeURIComponent(slug)}`,
  );
  if (!response.ok) return [];
  const detail = (await response.json()) as { images: PropertyImage[] };
  return detail.images.map((image) => ({
    id: image.id,
    url: image.url,
    isPrimary: image.isPrimary,
  }));
}

export function ImageUploader({
  propertyId,
  slug,
}: {
  propertyId: string;
  slug: string;
}) {
  const { accessToken } = useAuth();
  const fileInput = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [files, setFiles] = useState<FileList | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchImages(slug).then(setImages).catch(() => undefined);
  }, [slug]);

  async function upload() {
    if (!files?.length) return;
    setBusy(true);
    setMessage("");
    const body = new FormData();
    Array.from(files).forEach((file) => body.append("images", file));
    try {
      const response = await fetch(
        `${apiUrl}/api/properties/${propertyId}/images`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body,
        },
      );
      const result = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(result?.error?.message ?? "Upload failed.");
      setMessage(
        `${result.length} image${result.length === 1 ? "" : "s"} uploaded.`,
      );
      setFiles(null);
      if (fileInput.current) fileInput.current.value = "";
      await revalidateProperty(slug, accessToken);
      setImages(await fetchImages(slug));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(imageId: string) {
    if (!window.confirm("Remove this image?")) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(
        `${apiUrl}/api/properties/${propertyId}/images/${imageId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(
          result?.error?.message ?? "Could not remove the image.",
        );
      }
      setMessage("Image removed.");
      await revalidateProperty(slug, accessToken);
      setImages(await fetchImages(slug));
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not remove the image.",
      );
    } finally {
      setBusy(false);
    }
  }

  const full = images.length >= imageLimit;

  return (
    <section className="rounded-md border border-line bg-surface p-5">
      <h2 className="text-lg font-semibold text-ink">Property images</h2>
      <p className="mt-1 text-sm text-muted">
        JPEG, PNG, or WebP. Up to five images, 5 MB each. The first image is the
        cover.
      </p>
      {images.length ? (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image, index) => (
            <li
              key={image.id}
              className="overflow-hidden rounded-md border border-line"
            >
              <div className="relative aspect-[4/3] bg-brand-subtle">
                <Image
                  src={image.url}
                  alt={`Property image ${index + 1}`}
                  fill
                  sizes="(min-width: 640px) 260px, 45vw"
                  className="object-cover"
                />
                {image.isPrimary ? (
                  <span className="absolute left-2 top-2 rounded-full bg-brand-subtle px-2 py-0.5 text-xs font-medium text-brand">
                    Cover
                  </span>
                ) : null}
              </div>
              <div className="flex items-center justify-between gap-2 pl-3">
                <span className="text-xs text-muted">
                  {image.isPrimary ? "Cover image" : `Image ${index + 1}`}
                </span>
                <button
                  type="button"
                  onClick={() => remove(image.id)}
                  disabled={busy}
                  className="inline-flex min-h-11 items-center px-3 text-xs font-semibold text-danger hover:underline disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-muted">No images yet. Add up to five.</p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setFiles(event.target.files)
          }
          disabled={full || busy}
          className="block min-h-11 max-w-full text-sm text-muted file:mr-3 file:rounded-sm file:border-0 file:bg-brand-subtle file:px-3 file:py-2 file:font-semibold file:text-brand disabled:opacity-60"
        />
        <button
          type="button"
          onClick={upload}
          disabled={!files?.length || busy || full}
          className="min-h-11 rounded-sm bg-brand px-4 font-semibold text-white hover:bg-brand-hover disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {busy ? "Working..." : "Upload images"}
        </button>
      </div>
      <p className="mt-3 text-sm text-muted">
        {images.length} of {imageLimit} images used.
        {full ? " Remove an image to add another." : ""}
      </p>
      {message ? (
        <p className="mt-1 text-sm text-muted" role="status">
          {message}
        </p>
      ) : null}
    </section>
  );
}
