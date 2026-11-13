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
  submitWas,
} from "../../../styles/menu/options.drawer.css";
import { visuallyHidden } from "../../../styles/common/global.css";

interface ProductOptionsFooterProps {
  options: ReturnType<typeof useProductOptionsHook>;
}

const ProductOptionsFooter = ({ options }: ProductOptionsFooterProps) => {
  const {
    draft,
    setQuantity,
    submit: commit,
    total,
    listTotal,
    isDiscounted,
    editing,
    selectedSize,
  } = options;

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
        {isDiscounted ? (
          <s className={submitWas}>
            <span className={visuallyHidden}>was </span>
            {formatPeso(listTotal)}
          </s>
        ) : null}
        {formatPeso(total)}
      </button>
    </div>
  );
};

export default ProductOptionsFooter;
