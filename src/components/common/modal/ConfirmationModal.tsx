import { Button, Input, Modal, Space, Typography } from "antd";
import { useState } from "react";

interface ConfirmationModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  danger?: boolean;
  loading?: boolean;
  /// Shows a reason field and hands the text to onConfirm — the queue's cancel
  /// flow needs it, plain confirmations do not.
  withReason?: boolean;
  reasonLabel?: string;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
}

const ConfirmationModal = ({
  open,
  title,
  description,
  confirmText = "Confirm",
  danger,
  loading,
  withReason,
  reasonLabel = "Reason (optional)",
  onConfirm,
  onCancel,
}: ConfirmationModalProps) => {
  const [reason, setReason] = useState("");

  const close = () => {
    setReason("");
    onCancel();
  };

  return (
    <Modal
      open={open}
      title={title}
      onCancel={close}
      centered
      width={420}
      footer={
        <Space>
          <Button onClick={close}>Keep it</Button>
          <Button
            type="primary"
            danger={danger}
            loading={loading}
            onClick={() => onConfirm(reason.trim() || undefined)}
          >
            {confirmText}
          </Button>
        </Space>
      }
    >
      {description ? <Typography.Paragraph>{description}</Typography.Paragraph> : null}
      {withReason ? (
        <Input.TextArea
          rows={3}
          maxLength={200}
          placeholder={reasonLabel}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
      ) : null}
    </Modal>
  );
};

export default ConfirmationModal;
