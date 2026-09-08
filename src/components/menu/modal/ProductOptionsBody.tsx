import { CheckOutlined } from "@ant-design/icons";
import { Input } from "antd";
import { sweetnessLevels, temperatureLabel } from "../../../enums/order.enum";
import type { useProductOptionsHook } from "../../../hook/data/menu/product.options.hook";
import { formatPeso } from "../../../utils/formatter.utils";
import {
  addonCheck,
  addonCheckActive,
  addonName,
  addonPrice,
  addonRow,
  addonRowActive,
  addonList,
  body,
  group,
  groupHint,
  groupLabel,
  groupTitle,
  notesField,
  optionRow,
  optionTile,
  optionTileActive,
  optionTileLabel,
  optionTileMeta,
} from "../../../styles/menu/options.drawer.css";

type OptionsHook = ReturnType<typeof useProductOptionsHook>;

interface ProductOptionsBodyProps {
  options: OptionsHook;
}

const OptionTile = ({
  label,
  meta,
  active,
  onClick,
}: {
  label: string;
  meta?: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    className={active ? `${optionTile} ${optionTileActive}` : optionTile}
    onClick={onClick}
    aria-pressed={active}
  >
    <span className={optionTileLabel}>{label}</span>
    {meta ? <span className={optionTileMeta}>{meta}</span> : null}
  </button>
);

/// Size, temperature, sweetness and add-ons. Groups on offer for neither the
/// category nor the chosen size are simply absent — a coffee has no sweetness
/// row, a cookie no "Serve it" row, a fruit tea no add-ons.
const ProductOptionsBody = ({ options }: ProductOptionsBodyProps) => {
  const {
    section,
    sizes,
    draft,
    temperatures,
    temperature,
    setSize,
    setTemperature,
    setSweetness,
    toggleAddon,
    setNotes,
  } = options;

  if (!section) return null;

  return (
    <div className={body}>
      {sizes.length > 0 && (
        <div className={group}>
          <div className={groupLabel}>
            <span className={groupTitle}>Size</span>
            {sizes.length === 1 ? (
              <span className={groupHint}>One size only</span>
            ) : null}
          </div>
          <div className={optionRow}>
            {sizes.map((size) => (
              <OptionTile
                key={size.id}
                label={size.label}
                meta={formatPeso(size.price)}
                active={draft.sizeId === size.id}
                onClick={() => setSize(size.id)}
              />
            ))}
          </div>
        </div>
      )}

      {temperatures.length > 0 && (
        <div className={group}>
          <div className={groupLabel}>
            <span className={groupTitle}>Serve it</span>
            {temperatures.length === 1 ? (
              <span className={groupHint}>
                {temperatureLabel[temperatures[0]]} only
              </span>
            ) : null}
          </div>
          <div className={optionRow}>
            {temperatures.map((option) => (
              <OptionTile
                key={option}
                label={temperatureLabel[option]}
                active={temperature === option}
                onClick={() => setTemperature(option)}
              />
            ))}
          </div>
        </div>
      )}

      {section.has_sweetness && (
        <div className={group}>
          <div className={groupLabel}>
            <span className={groupTitle}>Sweetness</span>
            <span className={groupHint}>Free</span>
          </div>
          <div className={optionRow}>
            {sweetnessLevels.map((level) => (
              <OptionTile
                key={level}
                label={level}
                meta={level === "5g" ? "mild, not too sweet" : "on the sweeter side"}
                active={draft.sweetness === level}
                onClick={() => setSweetness(level)}
              />
            ))}
          </div>
        </div>
      )}

      {section.addons.length > 0 && (
        <div className={group}>
          <div className={groupLabel}>
            <span className={groupTitle}>Customise</span>
            <span className={groupHint}>Optional</span>
          </div>
          <div className={addonList}>
            {section.addons.map((addon) => {
              const active = draft.addonIds.includes(addon.id);
              return (
                <button
                  key={addon.id}
                  type="button"
                  className={active ? `${addonRow} ${addonRowActive}` : addonRow}
                  onClick={() => toggleAddon(addon.id)}
                  aria-pressed={active}
                >
                  <span className={active ? `${addonCheck} ${addonCheckActive}` : addonCheck}>
                    <CheckOutlined />
                  </span>
                  <span className={addonName}>{addon.name}</span>
                  <span className={addonPrice}>+{formatPeso(addon.price)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className={group}>
        <div className={groupLabel}>
          <span className={groupTitle}>Note for the barista</span>
        </div>
        <Input.TextArea
          className={notesField}
          rows={2}
          maxLength={140}
          showCount
          placeholder="Less ice, extra hot, no straw…"
          value={draft.notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </div>
    </div>
  );
};

export default ProductOptionsBody;
