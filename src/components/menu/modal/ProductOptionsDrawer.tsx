import { CloseOutlined } from "@ant-design/icons";
import { Drawer, Grid } from "antd";
import ProductImage from "../../common/media/ProductImage";
import { useAccentVars } from "../../../hook/common/accent.hook";
import { useBrandVars } from "../../../hook/common/brand.hook";
import type { useProductOptionsHook } from "../../../hook/data/menu/product.options.hook";
import ProductOptionsBody from "./ProductOptionsBody";
import ProductOptionsFooter from "./ProductOptionsFooter";
import {
  closeButton,
  drawerRoot,
  head,
  headBadge,
  headDescription,
  headTitle,
} from "../../../styles/menu/options.drawer.css";
import { mediaHero } from "../../../styles/common/media.css";

interface ProductOptionsDrawerProps {
  options: ReturnType<typeof useProductOptionsHook>;
}

const ProductOptionsDrawer = ({ options }: ProductOptionsDrawerProps) => {
  const screens = Grid.useBreakpoint();
  const accentVars = useAccentVars(options.section?.accent_color);
  // The drawer portals to <body>, outside the root that carries the style
  // contract, so both var sets have to be re-assigned on its own content.
  const brandVars = useBrandVars();

  const { visible, product, section, close, editing } = options;
  const isDesktop = Boolean(screens.md);

  return (
    <Drawer
      open={visible}
      onClose={close}
      placement={isDesktop ? "right" : "bottom"}
      width={isDesktop ? 460 : undefined}
      height={isDesktop ? undefined : "88dvh"}
      closable={false}
      destroyOnHidden
      styles={{
        body: { padding: 0 },
        content: {
          borderTopLeftRadius: isDesktop ? 0 : 24,
          borderTopRightRadius: isDesktop ? 0 : 24,
          overflow: "hidden",
        },
      }}
    >
      <div className={drawerRoot} style={{ ...brandVars, ...accentVars }}>
        {/* Anchored to the sheet rather than the header so it stays reachable
            whether or not the photo above it is there. */}
        <button type="button" className={closeButton} onClick={close} aria-label="Close">
          <CloseOutlined />
        </button>

        {/* Skipped, not shown as a placeholder: an item still waiting on its
            photo should not open onto a blank slab the height of a hero. */}
        {product?.image_url ? (
          <ProductImage
            src={product.image_url}
            alt={product.name}
            className={mediaHero}
          />
        ) : null}

        <div className={head}>
          {section ? (
            <span className={headBadge}>
              {editing ? "Editing · " : ""}
              {section.name}
            </span>
          ) : null}
          <h2 className={headTitle}>{product?.name}</h2>
          {product?.description ? (
            <p className={headDescription}>{product.description}</p>
          ) : null}
        </div>

        <ProductOptionsBody options={options} />
        <ProductOptionsFooter options={options} />
      </div>
    </Drawer>
  );
};

export default ProductOptionsDrawer;
