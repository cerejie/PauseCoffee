import { useAccentVars } from "../../../hook/common/accent.hook";
import { statusPalette } from "../../../constants/brand.constants";
import { OrderStatusEnum, orderStatusLabel } from "../../../enums/order.enum";
import type { IOrderTicket } from "../../../models/data/order/order.response";
import OrderTicketCard from "./OrderTicketCard";
import {
  board,
  column,
  columnBody,
  columnCount,
  columnDot,
  columnEmpty,
  columnHead,
  columnTitle,
} from "../../../styles/admin/queue.css";

interface QueueColumn {
  status: OrderStatusEnum;
  tickets: IOrderTicket[];
}

interface QueueBoardProps {
  columns: QueueColumn[];
  busy: boolean;
  onAdvance: (ticket: IOrderTicket) => void;
  onCancel: (ticket: IOrderTicket) => void;
}

const emptyCopy: Record<string, string> = {
  [OrderStatusEnum.Pending]: "No new orders right now.",
  [OrderStatusEnum.Preparing]: "Nothing on the bar.",
  [OrderStatusEnum.Ready]: "Nothing waiting for pickup.",
};

const QueueColumnView = ({
  entry,
  busy,
  onAdvance,
  onCancel,
}: {
  entry: QueueColumn;
  busy: boolean;
  onAdvance: (ticket: IOrderTicket) => void;
  onCancel: (ticket: IOrderTicket) => void;
}) => {
  const accentVars = useAccentVars(statusPalette[entry.status]?.fg);

  return (
    <section className={column} style={accentVars}>
      <header className={columnHead}>
        <span className={columnDot} />
        <span className={columnTitle}>{orderStatusLabel[entry.status]}</span>
        <span className={columnCount}>{entry.tickets.length}</span>
      </header>

      <div className={columnBody}>
        {entry.tickets.length === 0 ? (
          <p className={columnEmpty}>{emptyCopy[entry.status]}</p>
        ) : (
          entry.tickets.map((ticket) => (
            <OrderTicketCard
              key={ticket.id}
              ticket={ticket}
              busy={busy}
              onAdvance={onAdvance}
              onCancel={onCancel}
            />
          ))
        )}
      </div>
    </section>
  );
};

const QueueBoard = ({ columns, busy, onAdvance, onCancel }: QueueBoardProps) => (
  <div className={board}>
    {columns.map((entry) => (
      <QueueColumnView
        key={entry.status}
        entry={entry}
        busy={busy}
        onAdvance={onAdvance}
        onCancel={onCancel}
      />
    ))}
  </div>
);

export default QueueBoard;
