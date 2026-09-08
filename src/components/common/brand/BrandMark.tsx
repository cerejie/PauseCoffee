import {
  brandBar,
  brandBars,
  brandLockup,
  brandRoundel,
  brandStack,
  brandSub,
  brandSubLight,
  brandWord,
  brandWordLight,
} from "../../../styles/layout/customer.layout.css";

interface BrandMarkProps {
  /// Hides the wordmark so the roundel can stand alone in tight chrome.
  markOnly?: boolean;
  /// "light" inverts the wordmark for the espresso-grounded chrome — the admin
  /// sider and the login panel, where the heading token is unreadable.
  tone?: "dark" | "light";
  className?: string;
}

/// The Pause roundel — the pause bars inside an amber disc, redrawn rather
/// than shipped as an image so it stays crisp at every size and inherits the
/// espresso token.
const BrandMark = ({ markOnly, tone = "dark", className }: BrandMarkProps) => {
  const light = tone === "light";

  return (
    <span className={className ? `${brandLockup} ${className}` : brandLockup}>
      <span className={brandRoundel}>
        <span className={brandBars}>
          <span className={brandBar} />
          <span className={brandBar} />
        </span>
      </span>

      {!markOnly && (
        <span className={brandStack}>
          <span className={light ? `${brandWord} ${brandWordLight}` : brandWord}>
            Pause
          </span>
          <span className={light ? `${brandSub} ${brandSubLight}` : brandSub}>
            Coffee
          </span>
        </span>
      )}
    </span>
  );
};

export default BrandMark;
