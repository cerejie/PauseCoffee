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
