import { LoadingOutlined, PictureOutlined } from "@ant-design/icons";
import { Upload } from "antd";
import ProductImage from "../../common/media/ProductImage";
import { useProductImageHook } from "../../../hook/data/admin/product.image.hook";
import { menuImageAccept } from "../../../constants/image.constants";
import {
  uploadHint,
  uploadOverlay,
  uploadPlaceholder,
  uploadPreview,
  uploadTile,
} from "../../../styles/common/media.css";

interface ProductImageUploadProps {
  /// Injected by Form.Item — the object path stored on the product row.
  value?: string | null;
  onChange?: (path: string | null) => void;
  /// Lets the form remember what it put in the bucket, so a photo picked and
  /// then abandoned can be swept up when the modal closes.
  onUploaded?: (path: string) => void;
}

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
        <div className={uploadTile}>
          {isUploading ? (
            <span className={uploadPlaceholder}>
              <LoadingOutlined style={{ fontSize: 20 }} />
              Uploading…
            </span>
          ) : previewUrl ? (
            <>
              <ProductImage src={previewUrl} alt="Item photo" className={uploadPreview} />
              <span className={uploadOverlay}>Replace</span>
            </>
          ) : (
            <span className={uploadPlaceholder}>
              <PictureOutlined style={{ fontSize: 20 }} />
              Add a photo
            </span>
          )}
        </div>
      </Upload>

      <p className={uploadHint}>
        Shown on the customer menu. Square shots work best — it is resized and
        compressed before upload.
      </p>
    </div>
  );
};

export default ProductImageUpload;
