import { CheckOutlined, CoffeeOutlined, TeamOutlined } from "@ant-design/icons";
import type { ReactNode } from "react";
import { OrderStatusEnum, orderStatusLabel } from "../../../enums/order.enum";
import { formatTime } from "../../../utils/formatter.utils";
import {
  queueBanner,
  stepBody,
  stepDot,
  stepDotActive,
  stepDotDone,
  stepMeta,
  stepRow,
  stepRowDone,
  stepTitle,
  stepTitleMuted,
  steps as stepsClass,
} from "../../../styles/order/tracker.css";

interface OrderStep {
  status: OrderStatusEnum;
  at: string | null;
  done: boolean;
  active: boolean;
}

interface OrderProgressProps {
  steps: OrderStep[];
  queuePosition: number;
  status: OrderStatusEnum;
}

const stepCopy: Record<string, { icon: ReactNode; hint: string }> = {
  [OrderStatusEnum.Pending]: {
    icon: <CheckOutlined />,
    hint: "The counter has your order.",
  },
  [OrderStatusEnum.Preparing]: {
    icon: <CoffeeOutlined />,
    hint: "A barista is on it.",
  },
  [OrderStatusEnum.Ready]: {
    icon: <TeamOutlined />,
    hint: "Come collect it at the counter.",
  },
};

const OrderProgress = ({ steps, queuePosition, status }: OrderProgressProps) => (
  <div className={stepsClass}>
    {steps.map((step) => {
      const copy = stepCopy[step.status];
      const reached = step.done || step.active;

      return (
        <div
          key={step.status}
          className={step.done ? `${stepRow} ${stepRowDone}` : stepRow}
        >
          <span
            className={[
              stepDot,
              reached ? stepDotDone : "",
              step.active ? stepDotActive : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {step.done ? <CheckOutlined /> : copy.icon}
          </span>

          <div className={stepBody}>
            <div className={reached ? stepTitle : `${stepTitle} ${stepTitleMuted}`}>
              {orderStatusLabel[step.status]}
            </div>
            <div className={stepMeta}>
              {step.at ? formatTime(step.at) : copy.hint}
            </div>
          </div>
        </div>
      );
    })}

    {/* Only worth saying while there is actually a line ahead of them. */}
    {status === OrderStatusEnum.Pending && queuePosition > 0 ? (
      <div className={queueBanner}>
        <TeamOutlined />
        {queuePosition} {queuePosition === 1 ? "order is" : "orders are"} ahead of yours.
      </div>
    ) : null}
  </div>
);

export default OrderProgress;
