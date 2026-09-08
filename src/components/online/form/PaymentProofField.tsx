import {
  CheckCircleFilled,
  CloudUploadOutlined,
  DeleteOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { Button, Upload } from "antd";
import { paymentProofAccept } from "../../../constants/payment.constants";
import { usePaymentProofHook } from "../../../hook/data/online/payment.proof.hook";
import {
  proofActions,
  proofDone,
  proofPlaceholder,
  proofPreview,
  proofTile,
  proofTileFilled,
} from "../../../styles/online/online.css";

interface PaymentProofFieldProps {
  /// Injected by Form.Item — the object path the upload returned.
  value?: string | null;
  onChange?: (path: string | null) => void;
}

/// The receipt. Without one there is no order — and that is enforced by
/// place_order and by a check constraint beneath it, not by this component.
/// What happens here is only the upload: the path it returns is the token the
/// checkout payload carries, and the server proves the object exists before it
/// will accept it.
///
/// The preview is a local object URL. The payment-proofs bucket is private and
/// a guest has no read policy on it, so the only reason the customer can see
/// their own receipt is that their browser still holds the file.
const PaymentProofField = ({ value, onChange }: PaymentProofFieldProps) => {
  const { previewUrl, isUploading, upload, clear } = usePaymentProofHook();

  const handleFile = async (file: File) => {
    const path = await upload(file);
    if (path) onChange?.(path);
  };

  const handleRemove = () => {
    clear();
    onChange?.(null);
  };

  return (
    <div>
      <Upload
        accept={paymentProofAccept}
        showUploadList={false}
        disabled={isUploading}
        beforeUpload={(file) => {
          void handleFile(file);
          // The upload is a Supabase Storage call; antd must not also try.
          return Upload.LIST_IGNORE;
        }}
      >
        <div className={value ? `${proofTile} ${proofTileFilled}` : proofTile}>
          {isUploading ? (
            <span className={proofPlaceholder}>
              <LoadingOutlined style={{ fontSize: 22 }} />
              Uploading your receipt…
            </span>
          ) : value ? (
            <div style={{ width: "100%" }}>
              {previewUrl ? (
                <img src={previewUrl} alt="Your receipt" className={proofPreview} />
              ) : null}
              <div className={proofDone}>
                <CheckCircleFilled />
                Receipt attached
              </div>
            </div>
          ) : (
            <span className={proofPlaceholder}>
              <CloudUploadOutlined style={{ fontSize: 24 }} />
              Upload your payment receipt
              <span style={{ fontWeight: 500, fontSize: 11.5 }}>
                A screenshot from GCash or your bank app
              </span>
            </span>
          )}
        </div>
      </Upload>

      {value ? (
        <div className={proofActions}>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={handleRemove}>
            Use a different one
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default PaymentProofField;
