import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, Select, Tooltip, type TableProps } from "antd";
import { useMemo } from "react";
import CardTable from "../../common/table/CardTable";
import { TwoLineCell } from "../../common/table/cells/TwoLineCell";
import { StatusTag } from "../../common/tag/StatusTag";
import {
  OrderStatusEnum,
  orderStatusLabel,
  orderTypeLabel,
} from "../../../enums/order.enum";
import { useOrderHistoryHook } from "../../../hook/data/admin/order.history.hook";
import type { IOrderTicket } from "../../../models/data/order/order.response";
import { formatDateTime, formatPeso } from "../../../utils/formatter.utils";
import { describeItem } from "../../../utils/order.utils";
import {
  panel,
  toolbar,
  toolbarControl,
  toolbarSearch,
} from "../../../styles/layout/admin.layout.css";

const statusOptions = Object.values(OrderStatusEnum).map((status) => ({
  value: status,
  label: orderStatusLabel[status],
}));

const OrderHistoryTable = () => {
  const {
    rows,
    totalCount,
    pagination,
    search,
    setSearch,
    status,
    setStatus,
    onTableChange,
    isLoading,
    isFetching,
    refetch,
  } = useOrderHistoryHook();

  const columns = useMemo<TableProps<IOrderTicket>["columns"]>(
    () => [
      {
        title: "Order",
        dataIndex: "order_number",
        key: "order_number",
        render: (_value, record) => (
          <TwoLineCell
            top={record.order_number}
            bottom={formatDateTime(record.placed_at)}
          />
        ),
      },
      {
        title: "Customer",
        dataIndex: "customer_name",
        key: "customer_name",
        render: (_value, record) => (
          <TwoLineCell
            top={record.customer_name}
            bottom={orderTypeLabel[record.order_type]}
          />
        ),
      },
      {
        title: "Items",
        key: "items",
        render: (_value, record) => (
          <TwoLineCell
            top={`${record.item_count} ${record.item_count === 1 ? "cup" : "cups"}`}
            bottom={record.order_items
              .map((item) => `${item.quantity}× ${item.product_name}`)
              .join(", ")}
          />
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (_value, record) => <StatusTag status={record.status} dot />,
      },
      {
        title: "Total",
        dataIndex: "total",
        key: "total",
        align: "right",
        render: (_value, record) => (
          <span style={{ fontWeight: 700 }}>{formatPeso(record.total)}</span>
        ),
      },
    ],
    [],
  );

  return (
    <div className={panel}>
      <div className={toolbar}>
        <div className={toolbarSearch}>
          <Input
            allowClear
            prefix={<SearchOutlined style={{ opacity: 0.45 }} />}
            placeholder="Search a code or a name…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <Select
          allowClear
          placeholder="Any status"
          style={{ minWidth: 170 }}
          options={statusOptions}
          value={status}
          onChange={(value) => setStatus(value ?? null)}
        />

        <div className={toolbarControl}>
          <Tooltip title="Refresh">
            <Button
              icon={<ReloadOutlined />}
              loading={isFetching}
              onClick={() => void refetch()}
            />
          </Tooltip>
        </div>
      </div>

      <CardTable<IOrderTicket>
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={rows}
        expandable={{
          expandedRowRender: (record) => (
            <div style={{ display: "grid", gap: 6, padding: "4px 0" }}>
              {record.order_items.map((item) => (
                <div key={item.id} style={{ fontSize: 13 }}>
                  <strong>
                    {item.quantity}× {item.product_name}
                  </strong>{" "}
                  <span style={{ opacity: 0.65 }}>{describeItem(item)}</span>
                  {item.notes ? (
                    <em style={{ opacity: 0.65 }}> — “{item.notes}”</em>
                  ) : null}
                </div>
              ))}
              {record.notes ? (
                <div style={{ fontSize: 13, fontStyle: "italic", opacity: 0.7 }}>
                  Order note: “{record.notes}”
                </div>
              ) : null}
            </div>
          ),
        }}
        pagination={{
          current: Number(pagination.pageNumber),
          pageSize: Number(pagination.pageSize),
          total: totalCount,
          showSizeChanger: true,
          showTotal: (total) => `${total} orders`,
          onChange: onTableChange,
        }}
      />
    </div>
  );
};

export default OrderHistoryTable;
