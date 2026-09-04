import { Table, type TableProps } from "antd";
import { cardTable } from "../../../styles/table/cardTable.css";

/// antd Table with the house look. Takes every Table prop; the tinted header
/// and the cream rows are the only thing it adds.
function CardTable<T extends object>({ className, scroll, ...props }: TableProps<T>) {
  return (
    <Table<T>
      {...props}
      // Narrow containers scroll their columns instead of losing them. A caller
      // passing `scroll` still wins.
      scroll={scroll ?? { x: "max-content" }}
      className={className ? `${cardTable} ${className}` : cardTable}
    />
  );
}

export default CardTable;
