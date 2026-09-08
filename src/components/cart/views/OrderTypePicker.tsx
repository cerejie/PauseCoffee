import { CarOutlined, ShopOutlined, ShoppingOutlined } from "@ant-design/icons";
import { OrderTypeEnum } from "../../../enums/order.enum";
import { typeRow, typeTile, typeTileActive } from "../../../styles/cart/cart.css";

const typeIcons: Record<OrderTypeEnum, React.ReactNode> = {
  [OrderTypeEnum.DineIn]: <ShopOutlined />,
  [OrderTypeEnum.TakeOut]: <ShoppingOutlined />,
  [OrderTypeEnum.Delivery]: <CarOutlined />,
};

interface OrderTypePickerProps {
  /// Which fulfilments this channel offers — never every value of the enum.
  /// The counter must not be offered Delivery, and the online app must not be
  /// offered Dine in.
  types: readonly OrderTypeEnum[];
  labelFor: (type: OrderTypeEnum) => string;
  /// Injected by antd Form.Item.
  value?: OrderTypeEnum;
  onChange?: (value: OrderTypeEnum) => void;
}

/// A controlled tile row, shaped so antd Form can drive it like any input.
/// Shared by both checkouts, which differ only in the tiles they offer and in
/// what they call a take-out.
const OrderTypePicker = ({
  types,
  labelFor,
  value,
  onChange,
}: OrderTypePickerProps) => (
  <div className={typeRow}>
    {types.map((type) => (
      <button
        key={type}
        type="button"
        className={value === type ? `${typeTile} ${typeTileActive}` : typeTile}
        onClick={() => onChange?.(type)}
        aria-pressed={value === type}
      >
        {typeIcons[type]}
        {labelFor(type)}
      </button>
    ))}
  </div>
);

export default OrderTypePicker;
