import type { ReactNode } from "react";
import { MenuGroupEnum } from "../../../enums/menu.group.enum";

interface MenuGroupIconProps {
  group: MenuGroupEnum;
  className?: string;
}

/// Line weight and joins are shared so the two glyphs read as one set however
/// large the tab is drawn. Sized in `em` — the tab's font-size is the only
/// thing that scales them.
const stroke = {
  viewBox: "0 0 24 24",
  width: "1em",
  height: "1em",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/// The menu groups are fixed by the `menu_group` type — two of them, and a
/// third is a migration rather than a row — so their glyphs are drawn here
/// rather than looked up. antd carries neither a cup-and-straw nor a burger,
/// and a whole icon package for two shapes is not worth the bundle.
const glyphs: Record<MenuGroupEnum, ReactNode> = {
  [MenuGroupEnum.Drinks]: (
    <>
      <path d="M13.6 5.4 L16.9 2.2" />
      <rect x="4.8" y="5.4" width="14.4" height="3.1" rx="1.55" />
      <path d="M6.7 8.9 L8.2 20.2 A1.8 1.8 0 0 0 10 21.8 H14 A1.8 1.8 0 0 0 15.8 20.2 L17.3 8.9" />
      <circle cx="10.7" cy="13.4" r="0.85" />
      <circle cx="13.3" cy="13.4" r="0.85" />
    </>
  ),
  [MenuGroupEnum.Food]: (
    <>
      <path d="M4.2 10.8 C4.2 6.6 7.7 3.6 12 3.6 C16.3 3.6 19.8 6.6 19.8 10.8 Z" />
      <circle cx="9.6" cy="7.9" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="12" cy="6.5" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="14.4" cy="7.9" r="0.7" fill="currentColor" stroke="none" />
      <rect x="4.2" y="12.1" width="15.6" height="2.8" rx="1.4" />
      <path d="M4.2 16.6 H19.8 V17.9 A3 3 0 0 1 16.8 20.9 H7.2 A3 3 0 0 1 4.2 17.9 Z" />
    </>
  ),
};

const MenuGroupIcon = ({ group, className }: MenuGroupIconProps) => (
  <svg {...stroke} className={className} aria-hidden focusable="false">
    {glyphs[group]}
  </svg>
);

export default MenuGroupIcon;
