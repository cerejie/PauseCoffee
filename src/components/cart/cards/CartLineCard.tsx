import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import ProductImage from "../../common/media/ProductImage";
import { useAccentVars } from "../../../hook/common/accent.hook";
import { temperatureLabel } from "../../../enums/order.enum";
import type { ICartLine } from "../../../models/data/order/cart.model";
import { formatPeso } from "../../../utils/formatter.utils";
import {
  line as lineClass,
  lineActions,
  lineBody,
  lineLink,
  lineLinkDanger,
  lineNote,
  lineOptionChip,
  lineOptions,
  linePrice,
  lineTail,
  lineTitle,
  stepper,
  stepperButton,
  stepperValue,
} from "../../../styles/cart/cart.css";
import { mediaLine } from "../../../styles/common/media.css";

interface CartLineCardProps {
  line: ICartLine;
  total: number;
  onQuantity: (quantity: number) => void;
  onEdit: () => void;
  onRemove: () => void;
}

const CartLineCard = ({
  line,
  total,
  onQuantity,
  onEdit,
  onRemove,
}: CartLineCardProps) => {
  const accentVars = useAccentVars(line.accentColor);

  return (
    <article className={lineClass} style={accentVars}>
      <ProductImage src={line.imageUrl} alt={line.productName} className={mediaLine} />

      <div className={lineBody}>
        <h3 className={lineTitle}>{line.productName}</h3>

        <div className={lineOptions}>
          <span className={lineOptionChip}>{line.sizeLabel}</span>
          {line.temperature ? (
            <span className={lineOptionChip}>{temperatureLabel[line.temperature]}</span>
          ) : null}
          {line.sweetness ? (
            <span className={lineOptionChip}>{line.sweetness} sweet</span>
          ) : null}
          {line.addons.map((addon) => (
            <span key={addon.id} className={lineOptionChip}>
              + {addon.name}
            </span>
          ))}
        </div>

        {line.notes ? <p className={lineNote}>“{line.notes}”</p> : null}

        <div className={lineActions}>
          <button type="button" className={lineLink} onClick={onEdit}>
            Edit
          </button>
          <button
            type="button"
            className={`${lineLink} ${lineLinkDanger}`}
            onClick={onRemove}
          >
            Remove
          </button>
        </div>
      </div>

      <div className={lineTail}>
        <span className={linePrice}>{formatPeso(total)}</span>
        <div className={stepper}>
          <button
            type="button"
            className={stepperButton}
            onClick={() => onQuantity(line.quantity - 1)}
            aria-label={`Decrease ${line.productName}`}
          >
            <MinusOutlined />
          </button>
          <span className={stepperValue}>{line.quantity}</span>
          <button
            type="button"
            className={stepperButton}
            onClick={() => onQuantity(line.quantity + 1)}
            disabled={line.quantity >= 50}
            aria-label={`Increase ${line.productName}`}
          >
            <PlusOutlined />
          </button>
        </div>
      </div>
    </article>
  );
};

export default CartLineCard;
