import { CoffeeOutlined } from "@ant-design/icons";
import {
  mediaBackdrop,
  mediaFallback,
  mediaFrame,
  mediaImage,
  mediaImageContain,
} from "../../../styles/common/media.css";

interface ProductImageProps {
  /// Already resolved to a URL by the service layer — components never turn a
  /// stored path into one themselves.
  src: string | null | undefined;
  alt: string;
  /// The size class the caller wants the frame to take (mediaCard, mediaLine…).
  className?: string;
  /// "cover" fills the frame and crops — right for a thumbnail, where the frame
  /// is the shape that matters. "contain" shows the product whole and fills the
  /// leftover band with a blurred copy of the same photo; the options hero uses
  /// it, because there the drink is what the customer came to look at.
  fit?: "cover" | "contain";
}

/// One picture element for the whole menu: the card thumb, the options hero,
/// the cart line and the admin table all render through it, so a product with
/// no photo yet degrades to the same accent tile everywhere instead of a
/// broken-image box in four different shapes.
const ProductImage = ({ src, alt, className, fit = "cover" }: ProductImageProps) => (
  <span className={className ? `${mediaFrame} ${className}` : mediaFrame}>
    {src ? (
      <>
        {/* Same src as the picture in front of it, so it costs one request. */}
        {fit === "contain" ? (
          <img className={mediaBackdrop} src={src} alt="" aria-hidden="true" />
        ) : null}

        <img
          className={fit === "contain" ? mediaImageContain : mediaImage}
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
        />
      </>
    ) : (
      <span className={mediaFallback} aria-hidden="true">
        <CoffeeOutlined />
      </span>
    )}
  </span>
);

export default ProductImage;
