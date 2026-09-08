export enum OrderStatusEnum {
  Pending = "pending",
  Preparing = "preparing",
  Ready = "ready",
  Completed = "completed",
  Cancelled = "cancelled",
}

export enum OrderTypeEnum {
  DineIn = "dine_in",
  TakeOut = "take_out",
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
  [OrderStatusEnum.Pending]: "Received",
  [OrderStatusEnum.Preparing]: "Preparing",
  [OrderStatusEnum.Ready]: "Ready for pickup",
  [OrderStatusEnum.Completed]: "Completed",
  [OrderStatusEnum.Cancelled]: "Cancelled",
};

export const orderTypeLabel: Record<OrderTypeEnum, string> = {
  [OrderTypeEnum.DineIn]: "Dine in",
  [OrderTypeEnum.TakeOut]: "Take out",
};

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

/// The barista's forward path. `completed` is terminal, so it has no next step.
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
