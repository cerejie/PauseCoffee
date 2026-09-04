import type { ReactNode } from "react";
import { twoLineBottom, twoLineTop } from "../../../../styles/table/cardTable.css";

interface TwoLineCellProps {
  top: ReactNode;
  bottom?: ReactNode;
}

/// A heading over a quieter detail line — the shape most columns in this app
/// want. Restyling two spans by hand in a column render is the failure mode.
export const TwoLineCell = ({ top, bottom }: TwoLineCellProps) => (
  <div>
    <div className={twoLineTop}>{top}</div>
    {bottom ? <div className={twoLineBottom}>{bottom}</div> : null}
  </div>
);
