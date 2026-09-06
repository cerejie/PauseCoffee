import { SaveOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd";
import type { ReactNode } from "react";
import { useBrandVars } from "../../../hook/common/brand.hook";
import {
  footer,
  head,
  headSubtitle,
  headTitle,
  modalShell,
} from "../../../styles/admin/masterfile.modal.css";

interface FormModalProps {
  open: boolean;
  title: string;
  /// The line under the title. Says what the form does, so the fields do not
  /// have to explain themselves one by one.
  subtitle?: string;
  width?: number;
  saving?: boolean;
  submitText: string;
  submitIcon?: ReactNode;
  onCancel: () => void;
  onSubmit: () => void;
  children: ReactNode;
}

/// The shell every masterfile form sits in: header, body, ruled footer. antd's
/// own `title`/`footer` are replaced rather than styled — the mock's header is
/// two lines and its footer is a right-aligned pair, neither of which is what
/// `okText` gives you.
///
/// The brand vars are re-assigned on `.ant-modal` because a Modal portals to
/// <body>, outside the root that carries the style contract.
const FormModal = ({
  open,
  title,
  subtitle,
  width = 640,
  saving,
  submitText,
  submitIcon,
  onCancel,
  onSubmit,
  children,
}: FormModalProps) => {
  const brandVars = useBrandVars();

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      centered
      width={width}
      destroyOnHidden
      className={modalShell}
      style={brandVars}
      title={null}
      footer={null}
    >
      <header className={head}>
        <h2 className={headTitle}>{title}</h2>
        {subtitle ? <p className={headSubtitle}>{subtitle}</p> : null}
      </header>

      {children}

      <div className={footer}>
        <Button size="large" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="primary"
          size="large"
          icon={submitIcon ?? <SaveOutlined />}
          loading={saving}
          onClick={onSubmit}
        >
          {submitText}
        </Button>
      </div>
    </Modal>
  );
};

export default FormModal;
