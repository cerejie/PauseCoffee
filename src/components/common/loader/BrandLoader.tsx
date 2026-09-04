import {
  loaderBar,
  loaderBarDelayed,
  loaderFullscreen,
  loaderLabel,
  loaderRoundel,
  loaderWrap,
} from "../../../styles/common/loader.css";

interface BrandLoaderProps {
  label?: string;
  fullscreen?: boolean;
}

/// The app's only loading state — the pause bars breathing. An antd Spin here
/// would be the one piece of chrome that does not belong to the brand.
const BrandLoader = ({ label, fullscreen }: BrandLoaderProps) => (
  <div className={fullscreen ? `${loaderWrap} ${loaderFullscreen}` : loaderWrap}>
    <div className={loaderRoundel}>
      <span className={loaderBar} />
      <span className={`${loaderBar} ${loaderBarDelayed}`} />
    </div>
    {label ? <span className={loaderLabel}>{label}</span> : null}
  </div>
);

export default BrandLoader;
