import { menuImageMaxEdge, menuImageQuality } from "../constants/image.constants";

/// Redraws the file through a canvas at a bounded size and re-encodes it as
/// WebP. A 4MB phone photo lands at roughly 60–100KB, which is what keeps a
/// whole menu's photography inside the storage and egress budget — and it is
/// the browser doing it because on-the-fly transformation is a paid feature.
export const compressMenuImage = async (file: File): Promise<Blob> => {
  const bitmap = await createImageBitmap(file);

  try {
    const scale = Math.min(1, menuImageMaxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("This browser can't process images.");

    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", menuImageQuality),
    );

    if (!blob) throw new Error("Couldn't process that image. Try a JPEG or PNG.");
    return blob;
  } finally {
    bitmap.close();
  }
};
