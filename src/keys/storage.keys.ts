/// localStorage namespaces. The cart survives a refresh mid-order; the last
/// placed order id is what lets the tracker reopen after the app is closed.
export const cartStorageKey = "pause.cart";
export const lastOrderStorageKey = "pause.last-order";
