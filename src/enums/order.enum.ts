export enum OrderStatusEnum {
  /// Online only: paid for, waiting on a human to verify the receipt. Never a
  /// queue status, so a ticket in this state cannot reach the barista's board.
  AwaitingApproval = "awaiting_approval",
  Pending = "pending",
  Preparing = "preparing",
  Ready = "ready",
  Completed = "completed",
  Cancelled = "cancelled",
  /// A human looked at the payment and said no. Distinct from Cancelled, which
  /// means a real order was stopped after it had already been accepted.
  Rejected = "rejected",
}

export enum OrderTypeEnum {
  DineIn = "dine_in",
  TakeOut = "take_out",
  Delivery = "delivery",
}

/// Which app the order came from. Everything that behaves differently online
/// keys off this rather than inspecting the other fields.
export enum OrderChannelEnum {
  InStore = "in_store",
  Online = "online",
}

export enum PaymentMethodEnum {
  GCash = "gcash",
  BankTransfer = "bank_transfer",
}

export enum MessageSenderEnum {
  Customer = "customer",
  Staff = "staff",
}

export enum TemperatureEnum {
  Iced = "iced",
  Hot = "hot",
}

/// How a priced size may be served — set per price row in the masterfile, not
/// per category: a 16oz can be iced-only while the 12oz beside it goes both
/// ways. `Both` is the only value that puts the question to the customer.
export enum ServeTemperatureEnum {
  Hot = "hot",
  Iced = "iced",
  Both = "both",
}

/// Printed on the matcha menu — the only two sweetness levels the shop pulls.
export const sweetnessLevels = ["5g", "9g"] as const;
export type SweetnessLevel = (typeof sweetnessLevels)[number];

export const orderStatusLabel: Record<OrderStatusEnum, string> = {
  [OrderStatusEnum.AwaitingApproval]: "Waiting for confirmation",
  [OrderStatusEnum.Pending]: "Received",
  [OrderStatusEnum.Preparing]: "Preparing",
  [OrderStatusEnum.Ready]: "Ready for pickup",
  [OrderStatusEnum.Completed]: "Completed",
  [OrderStatusEnum.Cancelled]: "Cancelled",
  [OrderStatusEnum.Rejected]: "Not accepted",
};

export const orderTypeLabel: Record<OrderTypeEnum, string> = {
  [OrderTypeEnum.DineIn]: "Dine in",
  [OrderTypeEnum.TakeOut]: "Take out",
  [OrderTypeEnum.Delivery]: "Delivery",
};

/// Online says "pickup" where the counter says "take out": the customer is
/// collecting something already paid for, not carrying away something they
/// just bought. Same enum value, different word for a different audience.
export const onlineOrderTypeLabel: Record<OrderTypeEnum, string> = {
  ...orderTypeLabel,
  [OrderTypeEnum.TakeOut]: "Pickup",
};

export const describeOrderType = (
  type: OrderTypeEnum,
  channel: OrderChannelEnum,
): string =>
  channel === OrderChannelEnum.Online
    ? onlineOrderTypeLabel[type]
    : orderTypeLabel[type];

/// The fulfilment tiles each channel may offer. Never `Object.values` here —
/// that would put Delivery in front of someone standing at the counter, and
/// Dine in in front of someone ordering from home.
export const inStoreOrderTypes = [
  OrderTypeEnum.DineIn,
  OrderTypeEnum.TakeOut,
] as const;

export const onlineOrderTypes = [
  OrderTypeEnum.Delivery,
  OrderTypeEnum.TakeOut,
] as const;

export const paymentMethodLabel: Record<PaymentMethodEnum, string> = {
  [PaymentMethodEnum.GCash]: "GCash",
  [PaymentMethodEnum.BankTransfer]: "Bank transfer",
};

export const paymentMethodOptions = Object.values(PaymentMethodEnum).map(
  (value) => ({ value, label: paymentMethodLabel[value] }),
);

export const temperatureLabel: Record<TemperatureEnum, string> = {
  [TemperatureEnum.Iced]: "Iced",
  [TemperatureEnum.Hot]: "Hot",
};

export const serveTemperatureLabel: Record<ServeTemperatureEnum, string> = {
  [ServeTemperatureEnum.Hot]: "Hot only",
  [ServeTemperatureEnum.Iced]: "Iced only",
  [ServeTemperatureEnum.Both]: "Hot or iced",
};

export const serveTemperatureOptions = Object.values(ServeTemperatureEnum).map(
  (value) => ({ value, label: serveTemperatureLabel[value] }),
);

/// The tiles the options drawer offers for a size. A single-temperature size
/// still shows its one tile — the customer is told how it comes rather than
/// left guessing.
export const serveTemperatureChoices: Record<
  ServeTemperatureEnum,
  readonly TemperatureEnum[]
> = {
  [ServeTemperatureEnum.Hot]: [TemperatureEnum.Hot],
  [ServeTemperatureEnum.Iced]: [TemperatureEnum.Iced],
  [ServeTemperatureEnum.Both]: [TemperatureEnum.Iced, TemperatureEnum.Hot],
};

/// The barista's forward path. `completed` is terminal, so it has no next step,
/// and neither awaiting_approval nor rejected appear: an online order joins
/// this path only once review_online_order has moved it to `pending`.
export const nextOrderStatus: Partial<Record<OrderStatusEnum, OrderStatusEnum>> = {
  [OrderStatusEnum.Pending]: OrderStatusEnum.Preparing,
  [OrderStatusEnum.Preparing]: OrderStatusEnum.Ready,
  [OrderStatusEnum.Ready]: OrderStatusEnum.Completed,
};

/// Columns on the queue board, in service order.
export const queueStatuses = [
  OrderStatusEnum.Pending,
  OrderStatusEnum.Preparing,
  OrderStatusEnum.Ready,
] as const;

/// The three stages a customer watches on the tracker. An online order shows
/// AwaitingApproval ahead of these; once approved it rejoins the same path.
export const trackerStatuses = [
  OrderStatusEnum.Pending,
  OrderStatusEnum.Preparing,
  OrderStatusEnum.Ready,
] as const;

/// Statuses that end an order without it ever being made.
export const refusedStatuses = [
  OrderStatusEnum.Cancelled,
  OrderStatusEnum.Rejected,
] as const;

/// Canned reasons on the reject dialog. Free text stays available — these just
/// cover the four the shop will type a hundred times.
export const rejectionReasons = [
  "The receipt did not match the order total.",
  "We could not read the receipt. Please send a clearer photo.",
  "We could not find this payment on our end.",
  "We are closed or out of stock for these items.",
] as const;
