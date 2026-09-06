import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import { rowActions } from "../../../../styles/table/cardTable.css";

interface RowActionsProps {
  /// The row's own name — it is what the screen reader announces, so "Edit"
  /// alone in a table of eleven identical buttons is not enough.
  label: string;
  onEdit: () => void;
  onDelete: () => void;
  deleting?: boolean;
}

/// Every masterfile table ends its rows the same way: edit, then a hard delete
/// behind a confirmation the list hook owns. One cell so the four screens
/// cannot drift on spacing, tooltips or labelling.
const RowActions = ({ label, onEdit, onDelete, deleting }: RowActionsProps) => (
  <span className={rowActions}>
    <Tooltip title="Edit">
      <Button
        type="text"
        icon={<EditOutlined />}
        onClick={onEdit}
        aria-label={`Edit ${label}`}
      />
    </Tooltip>
    <Tooltip title="Delete">
      <Button
        type="text"
        danger
        icon={<DeleteOutlined />}
        loading={deleting}
        onClick={onDelete}
        aria-label={`Delete ${label}`}
      />
    </Tooltip>
  </span>
);

export default RowActions;
