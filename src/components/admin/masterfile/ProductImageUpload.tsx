import {
  DeleteOutlined,
  EditOutlined,
  LoadingOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import { Button, Upload } from "antd";
import ProductImage from "../../common/media/ProductImage";
import { useProductImageHook } from "../../../hook/data/admin/product.image.hook";
import {
  menuImageAccept,
  menuImageMaxBytes,
} from "../../../constants/image.constants";
import {
  photoActions,
  photoBadge,
  photoHint,
  photoPlaceholder,
  photoPreview,
  photoTile,
  photoTileEmpty,
} from "../../../styles/admin/masterfile.modal.css";

interface ProductImageUploadProps {
  /// Injected by Form.Item — the object path stored on the product row.
  value?: string | null;
  onChange?: (path: string | null) => void;
  /// Lets the form remember what it put in the bucket, so a photo picked and
  /// then abandoned can be swept up when the modal closes.
  onUploaded?: (path: string) => void;
}

const maxMegabytes = Math.round(menuImageMaxBytes / (1024 * 1024));

/// The photo field on the item form. `beforeUpload` does the work and then
/// tells antd to forget the file: the upload is a Supabase Storage call, and
/// the only thing the form carries afterwards is the path it returned.
const ProductImageUpload = ({ value, onChange, onUploaded }: ProductImageUploadProps) => {
  const { previewUrl, isUploading, upload } = useProductImageHook(value);

  const handleFile = async (file: File) => {
    const path = await upload(file);
    if (!path) return;

    onUploaded?.(path);
    onChange?.(path);
  };

  /// The tile is the trigger: it carries its own instruction while empty and a
  /// pencil badge once filled, so the button that used to sit beneath it only
  /// opened the same picker a second time.
  return (
    <div>
      <Upload
        accept={menuImageAccept}
        showUploadList={false}
        disabled={isUploading}
        beforeUpload={(file) => {
          void handleFile(file);
          return Upload.LIST_IGNORE;
        }}
      >
        <div className={previewUrl ? photoTile : `${photoTile} ${photoTileEmpty}`}>
          {isUploading ? (
            <span className={photoPlaceholder}>
              <LoadingOutlined style={{ fontSize: 22 }} />
              Uploading…
            </span>
          ) : previewUrl ? (
            <>
              <ProductImage src={previewUrl} alt="Item photo" className={photoPreview} />
              <span className={photoBadge} aria-hidden="true">
                <EditOutlined />
              </span>
            </>
          ) : (
            <span className={photoPlaceholder}>
              <PictureOutlined style={{ fontSize: 22 }} />
              Add a photo
            </span>
          )}
        </div>
      </Upload>

      {/* Clears the field rather than the bucket. The photo is required, so
          the save stays blocked until another one takes its place — and the
          file itself is swept up when the modal closes. */}
      {previewUrl ? (
        <div className={photoActions}>
          <Button danger icon={<DeleteOutlined />} onClick={() => onChange?.(null)}>
            Remove
          </Button>
        </div>
      ) : null}

      <p className={photoHint}>
        Recommended: 1:1 square image
        JPG, PNG or WebP · Max {maxMegabytes} MB
      </p>
    </div>
  );
};

export default ProductImageUpload;
