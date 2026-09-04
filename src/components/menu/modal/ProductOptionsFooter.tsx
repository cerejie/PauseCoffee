import { MinusOutlined, PlusOutlined, ShoppingOutlined } from "@ant-design/icons";
import type { useProductOptionsHook } from "../../../hook/data/menu/product.options.hook";
import { formatPeso } from "../../../utils/formatter.utils";
import {
  footer,
  stepper,
  stepperButton,
  stepperValue,
  submit,
  submitDivider,
} from "../../../styles/menu/options.drawer.css";

interface ProductOptionsFooterProps {
  options: ReturnType<typeof useProductOptionsHook>;
}

const ProductOptionsFooter = ({ options }: ProductOptionsFooterProps) => {
  const { draft, setQuantity, submit: commit, total, editing, selectedSize } = options;

  return (
    <div className={footer}>
      <div className={stepper}>
        <button
          type="button"
          className={stepperButton}
          onClick={() => setQuantity(draft.quantity - 1)}
          disabled={draft.quantity <= 1}
          aria-label="Decrease quantity"
        >
          <MinusOutlined />
        </button>
        <span className={stepperValue}>{draft.quantity}</span>
        <button
          type="button"
          className={stepperButton}
          onClick={() => setQuantity(draft.quantity + 1)}
          disabled={draft.quantity >= 50}
          aria-label="Increase quantity"
        >
          <PlusOutlined />
        </button>
      </div>

      <button
        type="button"
        className={submit}
        onClick={commit}
        disabled={!selectedSize}
      >
        <ShoppingOutlined />
        {editing ? "Update" : "Add to cart"}
        <span className={submitDivider} />
        {formatPeso(total)}
      </button>
    </div>
  );
};

export default ProductOptionsFooter;
