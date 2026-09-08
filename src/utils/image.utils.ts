import { menuImageMaxEdge, menuImageQuality } from "../constants/image.constants";
import {
  paymentProofMaxEdge,
  paymentProofQuality,
  paymentQrMaxEdge,
  paymentQrQuality,
} from "../constants/payment.constants";

interface CompressOptions {
  /// Longest edge of the result, in pixels.
  maxEdge: number;
  /// WebP quality, 0–1.
  quality: number;
}

/// Redraws the file through a canvas at a bounded size and re-encodes it as
/// WebP. A 4MB phone photo lands at roughly 60–100KB, which is what keeps the
/// app's imagery inside the storage and egress budget — and it is the browser
/// doing it because on-the-fly transformation is a paid feature.
export const compressImage = async (
  file: File,
  { maxEdge, quality }: CompressOptions,
): Promise<Blob> => {
  const bitmap = await createImageBitmap(file);

  try {
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("This browser can't process images.");

    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", quality),
    );

    if (!blob) throw new Error("Couldn't process that image. Try a JPEG or PNG.");
    return blob;
  } finally {
    bitmap.close();
  }
};

/// Menu photography. A card thumbnail is 86px and the drawer hero about 460px,
/// so 800px serves both on a 2x screen.
export const compressMenuImage = (file: File): Promise<Blob> =>
  compressImage(file, { maxEdge: menuImageMaxEdge, quality: menuImageQuality });

/// A payment receipt. Kept larger and less compressed than a menu photo for one
/// reason: staff have to read an amount and a reference number off it before
/// they approve an order, and 800px of screenshot is not legible enough.
export const compressPaymentProof = (file: File): Promise<Blob> =>
  compressImage(file, { maxEdge: paymentProofMaxEdge, quality: paymentProofQuality });

/// The shop's payment QR. Highest fidelity of the three: lossy artefacts in the
/// finder patterns can stop a phone locking on, and a QR nobody can scan is a
/// day of orders the shop does not take.
export const compressPaymentQr = (file: File): Promise<Blob> =>
  compressImage(file, { maxEdge: paymentQrMaxEdge, quality: paymentQrQuality });
