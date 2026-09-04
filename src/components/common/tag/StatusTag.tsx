import { statusPalette } from "../../../constants/brand.constants";
import { OrderStatusEnum, orderStatusLabel } from "../../../enums/order.enum";
import { statusDot, statusPill } from "../../../styles/table/cardTable.css";

interface StatusTagProps {
  status: OrderStatusEnum | string | undefined;
  /// Draws the status colour as a leading dot — used in list tables.
  dot?: boolean;
  label?: string;
}

export const StatusTag = ({ status, dot, label }: StatusTagProps) => {
  const tone = statusPalette[status ?? ""] ?? statusPalette[OrderStatusEnum.Completed];
  const text =
    label ?? orderStatusLabel[status as OrderStatusEnum] ?? String(status ?? "—");

  return (
    <span className={statusPill} style={{ color: tone.fg, backgroundColor: tone.bg }}>
      {dot && <span className={statusDot} />}
      {text}
    </span>
  );
};
