import { menuImageBucket } from "./image.constants";

/// Receipts live in their own PRIVATE bucket (migration 0014), unlike menu
/// photography. A receipt carries a name, an account number and an amount; a
/// public object would put every customer's payment slip behind a guessable
/// URL. The anon key may write here and nothing else — staff read through a
/// short-lived signed URL.
export const paymentProofBucket = "payment-proofs";

/// The one prefix the bucket's insert policy allows. Anything else is refused
/// by Postgres before the bytes are accepted.
export const paymentProofPrefix = "proofs";

export const paymentProofMimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;
export const paymentProofAccept = paymentProofMimeTypes.join(",");

/// The raw file, before the browser downscales it. A screenshot from a phone
/// fits easily; the bucket itself caps the upload at 5 MB after compression.
export const paymentProofMaxBytes = 12 * 1024 * 1024;

/// A receipt has to stay legible — an amount and a reference number read at a
/// glance — so it keeps more detail than a menu photo, which only ever renders
/// at 86px. Still small enough that a day's orders cost pennies of storage.
export const paymentProofMaxEdge = 1400;
export const paymentProofQuality = 0.86;

/// How long a staff signed URL lives. Long enough to open and read the image,
/// short enough that a copied link is not a lasting leak.
export const paymentProofSignedUrlSeconds = 300;

/// The shop's payment QR shares the public menu-images bucket — it is public
/// data by definition, since the customer has to scan it. Which object is the
/// current QR is answered by app_settings.payment_qr_path (migration 0018),
/// not by a constant: the owner replaces it from the admin Settings screen.
export const paymentQrBucket = menuImageBucket;
export const paymentQrFolder = "shop";

/// A QR must survive being re-encoded and still scan, so it keeps far more
/// detail than a menu photo — which only ever renders at 86px on a card.
export const paymentQrMaxBytes = 12 * 1024 * 1024;
export const paymentQrMaxEdge = 1200;
export const paymentQrQuality = 0.95;
