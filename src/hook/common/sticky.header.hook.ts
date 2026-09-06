import { assignInlineVars } from "@vanilla-extract/dynamic";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { stickyHeaderHeight } from "../../styles/common/vars.css";

/// Measures the sticky header and publishes its height as a style var, so the
/// bars that dock underneath it can pin to the real edge. The header grows with
/// `env(safe-area-inset-top)` on a notched phone; a hardcoded offset leaves the
/// category rail sliding behind the header there instead of below it.
export const useStickyHeaderHook = () => {
  const headerRef = useRef<HTMLElement | null>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const element = headerRef.current;
    if (!element) return;

    const measure = () => setHeight(element.getBoundingClientRect().height);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  /// Undefined until the first measurement — the var's fallback covers that
  /// frame, so nothing renders against a zero-height header.
  const headerVars = useMemo(
    () => (height > 0 ? assignInlineVars({ [stickyHeaderHeight]: `${height}px` }) : undefined),
    [height],
  );

  return { headerRef, headerVars };
};
