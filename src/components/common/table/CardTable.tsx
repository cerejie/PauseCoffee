import { Table, type TableProps } from "antd";
import { cardTable } from "../../../styles/table/cardTable.css";

/// antd Table with the house look. Takes every Table prop; the tinted header
/// and the cream rows are the only thing it adds.
function CardTable<T extends object>({
  className,
  scroll,
  loading,
  dataSource,
  ...props
}: TableProps<T>) {
  // antd dims a table while it loads — half opacity under a pale scrim. Over
  // rows that are already on screen that does not read as progress, it reads as
  // the colours breaking: the headings and second lines wash out to nothing and
  // only the saturated cells survive. So the blocking spinner is kept for the
  // empty first load, and a refresh over existing rows leaves them legible —
  // the toolbar's own refresh button is what shows that work is in flight.
  const hasRows = Boolean(dataSource?.length);
  const spinning = typeof loading === "boolean" ? loading && !hasRows : loading;

  return (
    <Table<T>
      {...props}
      dataSource={dataSource}
      loading={spinning}
      // Narrow containers scroll their columns instead of losing them. A caller
      // passing `scroll` still wins.
      scroll={scroll ?? { x: "max-content" }}
      className={className ? `${cardTable} ${className}` : cardTable}
    />
  );
}

export default CardTable;
