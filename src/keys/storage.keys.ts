/// localStorage namespaces. The cart survives a refresh mid-order; the last
/// placed order id is what lets the tracker reopen after the app is closed.
export const cartStorageKey = "pause.cart";
export const lastOrderStorageKey = "pause.last-order";

/// The receipt a guest has uploaded but not yet checked out with. Survives a
/// refresh mid-checkout so a dropped connection does not cost them the upload —
/// and an abandoned one is swept from the bucket by migration 0017.
export const pendingProofStorageKey = "pause.pending-proof";
