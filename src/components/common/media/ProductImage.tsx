import { CoffeeOutlined } from "@ant-design/icons";
import {
  mediaFallback,
  mediaFrame,
  mediaImage,
} from "../../../styles/common/media.css";

interface ProductImageProps {
  /// Already resolved to a URL by the service layer — components never turn a
  /// stored path into one themselves.
  src: string | null | undefined;
  alt: string;
  /// The size class the caller wants the frame to take (mediaCard, mediaLine…).
  className?: string;
}

/// One picture element for the whole menu: the card thumb, the options hero,
/// the cart line and the admin table all render through it, so a product with
/// no photo yet degrades to the same accent tile everywhere instead of a
/// broken-image box in four different shapes.
const ProductImage = ({ src, alt, className }: ProductImageProps) => (
  <span className={className ? `${mediaFrame} ${className}` : mediaFrame}>
    {src ? (
      <img className={mediaImage} src={src} alt={alt} loading="lazy" decoding="async" />
    ) : (
      <span className={mediaFallback} aria-hidden="true">
        <CoffeeOutlined />
      </span>
    )}
  </span>
);

export default ProductImage;
