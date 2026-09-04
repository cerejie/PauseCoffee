import type { ReactNode } from "react";
import { displayText, mutedText } from "../../../styles/common/global.css";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/// One empty/zero state for the whole app — the menu with no matches, an empty
/// cart, a cleared queue column all read the same way.
const EmptyState = ({ icon, title, description, action, className }: EmptyStateProps) => (
  <div className={className}>
    {icon ? <div style={{ fontSize: 30, opacity: 0.5 }}>{icon}</div> : null}
    <h3 className={displayText} style={{ fontSize: 19, marginTop: icon ? 12 : 0 }}>
      {title}
    </h3>
    {description ? (
      <p className={mutedText} style={{ marginTop: 6, maxWidth: 340, marginInline: "auto" }}>
        {description}
      </p>
    ) : null}
    {action ? <div style={{ marginTop: 18 }}>{action}</div> : null}
  </div>
);

export default EmptyState;
