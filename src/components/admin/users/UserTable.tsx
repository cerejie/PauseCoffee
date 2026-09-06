import {
  CheckOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { Button, Input, Select, Tag, Tooltip, type TableProps } from "antd";
import { useMemo } from "react";
import CardTable from "../../common/table/CardTable";
import { TwoLineCell } from "../../common/table/cells/TwoLineCell";
import { StatusTag } from "../../common/tag/StatusTag";
import {
  AccessStatusEnum,
  accessStatusLabel,
} from "../../../enums/access.status.enum";
import { UserRoleEnum, userRoleLabel } from "../../../enums/role.enum";
import { useUserListHook } from "../../../hook/data/admin/user.list.hook";
import type { IUserAccount } from "../../../models/data/user/user.response";
import { formatDateTime } from "../../../utils/formatter.utils";
import {
  panel,
  toolbar,
  toolbarControl,
  toolbarSearch,
} from "../../../styles/layout/admin.layout.css";

const statusOptions = Object.values(AccessStatusEnum).map((status) => ({
  value: status,
  label: accessStatusLabel[status],
}));

/// Who can sign into the admin app. Sign-ups land here as `pending` holding no
/// access at all, so the row that needs a decision is the row that leads.
const UserTable = () => {
  const {
    rows,
    pendingCount,
    search,
    setSearch,
    status,
    setStatus,
    isLoading,
    isFetching,
    refetch,
    isSaving,
    canManage,
    approve,
    revoke,
    remove,
  } = useUserListHook();

  const columns = useMemo<TableProps<IUserAccount>["columns"]>(
    () => [
      {
        title: "Account",
        dataIndex: "full_name",
        key: "full_name",
        render: (_value, record) => (
          <TwoLineCell
            top={record.full_name || "—"}
            bottom={record.email ?? "no email on file"}
          />
        ),
      },
      {
        title: "Role",
        dataIndex: "role",
        key: "role",
        render: (_value, record) => (
          <Tag color={record.role === UserRoleEnum.SuperAdmin ? "gold" : undefined}>
            {userRoleLabel[record.role] ?? record.role}
          </Tag>
        ),
      },
      {
        title: "Access",
        dataIndex: "status",
        key: "status",
        render: (_value, record) => (
          <StatusTag status={record.status} label={accessStatusLabel[record.status]} dot />
        ),
      },
      {
        title: "Signed up",
        dataIndex: "created_at",
        key: "created_at",
        render: (_value, record) => formatDateTime(record.created_at),
      },
      {
        title: "",
        key: "actions",
        align: "right",
        render: (_value, record) => {
          // Your own row and any other superadmin's are read-only — the same
          // two rules the RPCs enforce, said once here so the table never
          // offers a button that can only fail.
          if (!canManage(record)) {
            return <span style={{ opacity: 0.45, fontSize: 12.5 }}>Protected</span>;
          }

          const pending = record.status === AccessStatusEnum.Pending;
          const approved = record.status === AccessStatusEnum.Approved;

          return (
            <span style={{ display: "inline-flex", gap: 4 }}>
              {approved ? null : (
                <Tooltip title={pending ? "Approve this request" : "Let them back in"}>
                  <Button
                    type="text"
                    icon={pending ? <CheckOutlined /> : <UndoOutlined />}
                    loading={isSaving}
                    onClick={() => approve(record)}
                    aria-label={`Approve ${record.full_name}`}
                  />
                </Tooltip>
              )}

              {record.status === AccessStatusEnum.Revoked ? null : (
                <Tooltip title={pending ? "Decline this request" : "Revoke access"}>
                  <Button
                    type="text"
                    icon={<StopOutlined />}
                    loading={isSaving}
                    onClick={() => revoke(record)}
                    aria-label={`Revoke ${record.full_name}`}
                  />
                </Tooltip>
              )}

              <Tooltip title="Delete for good">
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  loading={isSaving}
                  onClick={() => remove(record)}
                  aria-label={`Delete ${record.full_name}`}
                />
              </Tooltip>
            </span>
          );
        },
      },
    ],
    [canManage, approve, revoke, remove, isSaving],
  );

  return (
    <div className={panel}>
      <div className={toolbar}>
        <div className={toolbarSearch}>
          <Input
            allowClear
            prefix={<SearchOutlined style={{ opacity: 0.45 }} />}
            placeholder="Search a name or an email…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <Select
          allowClear
          placeholder="Any access"
          style={{ minWidth: 180 }}
          options={statusOptions}
          value={status}
          onChange={(value) => setStatus(value ?? null)}
        />

        {pendingCount > 0 ? (
          <Tag color="gold">
            {pendingCount} waiting on you
          </Tag>
        ) : null}

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

      <CardTable<IUserAccount>
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={rows}
        pagination={false}
      />
    </div>
  );
};

export default UserTable;
