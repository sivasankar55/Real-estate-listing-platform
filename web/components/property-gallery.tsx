"use client";

import Image from "next/image";
import { useState } from "react";

type GalleryImage = { id: string; url: string };

export function PropertyGallery({
  title,
  images,
}: {
  title: string;
  images: GalleryImage[];
}) {
  const [selected, setSelected] = useState(0);
  const current = images[selected];
  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-brand-subtle">
        {current ? (
          <Image
            src={current.url}
            alt={`${title} photo ${selected + 1}`}
            fill
            priority={selected === 0}
            sizes="(min-width: 1024px) 800px, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            No images available
          </div>
        )}
      </div>
      {images.length > 1 ? (
        <div
          className="mt-3 flex gap-2 overflow-x-auto pb-1"
          aria-label="Property photos"
        >
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              aria-label={`Show photo ${index + 1}`}
              aria-pressed={selected === index}
              onClick={() => setSelected(index)}
              className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-sm border-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${selected === index ? "border-brand" : "border-transparent"}`}
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
