/// React Query cache keys. One place, so an invalidation after a mutation and
/// the query it must refresh can never drift apart.
export const menuQueryKey = "menu";
export const addonsQueryKey = "addons";
export const orderQueryKey = "order";
export const orderQueueQueryKey = "order-queue";
export const orderHistoryQueryKey = "order-history";
export const adminCategoriesQueryKey = "admin-categories";
export const adminProductsQueryKey = "admin-products";
export const adminAddonsQueryKey = "admin-addons";
export const adminStatsQueryKey = "admin-stats";
export const sessionQueryKey = "session";
export const adminSizesQueryKey = "admin-sizes";
export const adminCategoryAddonsQueryKey = "admin-category-addons";
export const adminUsersQueryKey = "admin-users";
export const onlineOrdersQueryKey = "online-orders";
export const messageThreadsQueryKey = "message-threads";
/// The customer's whole conversation, keyed by the device that holds it, and
/// the staff view of one customer's — the two groupings of the same rows.
export const deviceMessagesQueryKey = "device-messages";
export const customerMessagesQueryKey = "customer-messages";
export const appSettingsQueryKey = "app-settings";
export const onlineOrderingOpenQueryKey = "online-ordering-open";
