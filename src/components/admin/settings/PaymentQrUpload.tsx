import {
  DeleteOutlined,
  EditOutlined,
  LoadingOutlined,
  QrcodeOutlined,
} from "@ant-design/icons";
import { Button, Upload } from "antd";
import ProductImage from "../../common/media/ProductImage";
import {
  paymentQrPreset,
  useImageUploadHook,
} from "../../../hook/data/admin/image.upload.hook";
import { menuImageAccept } from "../../../constants/image.constants";
import {
  qrActions,
  qrBadge,
  qrHint,
  qrLayout,
  qrPlaceholder,
  qrPreview,
  qrSide,
  qrTile,
  qrTileEmpty,
} from "../../../styles/admin/settings.css";

interface PaymentQrUploadProps {
  /// Injected by Form.Item — the object path stored on the settings row.
  value?: string | null;
  onChange?: (path: string | null) => void;
}

/// The QR customers scan to pay. Same mechanics as the product photo field —
/// `beforeUpload` does the work and tells antd to forget the file, because the
/// upload is a Supabase Storage call and the form only carries the path back.
/// What differs is the compression preset: a QR is re-encoded at near-lossless
/// quality, since artefacts in the finder patterns can stop a phone locking on.
const PaymentQrUpload = ({ value, onChange }: PaymentQrUploadProps) => {
  const { previewUrl, isUploading, upload } = useImageUploadHook(value, paymentQrPreset);

  const handleFile = async (file: File) => {
    const path = await upload(file);
    if (path) onChange?.(path);
  };

  return (
    <div className={qrLayout}>
      <Upload
        accept={menuImageAccept}
        showUploadList={false}
        disabled={isUploading}
        beforeUpload={(file) => {
          void handleFile(file);
          return Upload.LIST_IGNORE;
        }}
      >
        <div className={previewUrl ? qrTile : `${qrTile} ${qrTileEmpty}`}>
          {isUploading ? (
            <span className={qrPlaceholder}>
              <LoadingOutlined style={{ fontSize: 22 }} />
              Uploading…
            </span>
          ) : previewUrl ? (
            <>
              {/* White ground and object-fit: contain — a QR printed on a
                  coloured tile, or cropped, is a QR that will not scan. */}
              <ProductImage src={previewUrl} alt="Payment QR" className={qrPreview} />
              <span className={qrBadge} aria-hidden="true">
                <EditOutlined />
              </span>
            </>
          ) : (
            <span className={qrPlaceholder}>
              <QrcodeOutlined style={{ fontSize: 24 }} />
              Add your payment QR
            </span>
          )}
        </div>
      </Upload>

      <div className={qrSide}>
        <p className={qrHint}>
          This is what customers see on the online checkout, above the box where
          they upload their receipt. Take it straight from your GCash{" "}
          <strong>Receive Money</strong> screen, or your bank's app.
          <br />
          <br />
          Check it scans from a phone before you save — nobody can pay you with a
          QR that does not read.
        </p>

        {previewUrl ? (
          <div className={qrActions}>
            <Button danger icon={<DeleteOutlined />} onClick={() => onChange?.(null)}>
              Remove
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PaymentQrUpload;
