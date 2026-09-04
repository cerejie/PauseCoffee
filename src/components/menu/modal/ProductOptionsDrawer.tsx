import { CloseOutlined } from "@ant-design/icons";
import { Drawer, Grid } from "antd";
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
        <div className={head}>
          <button
            type="button"
            className={closeButton}
            onClick={close}
            aria-label="Close"
          >
            <CloseOutlined />
          </button>

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
