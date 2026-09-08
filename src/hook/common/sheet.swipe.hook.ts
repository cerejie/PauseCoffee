import { useCallback, useEffect, useRef } from "react";
import type { TouchEvent as ReactTouchEvent } from "react";

/// Past this much travel the sheet is going, however slowly the finger moved.
const DISMISS_DISTANCE = 96;
/// …and past this much speed it is going regardless of how far it travelled, so
/// a short flick dismisses the same way a long drag does.
const DISMISS_VELOCITY = 0.5;
const SETTLE_EASE = "transform .3s cubic-bezier(.32,.72,0,1)";

/// Drag-to-dismiss for the bottom sheet.
///
/// antd animates `.ant-drawer-content-wrapper`, so the drag drives that same
/// element: an inline transform outranks the motion class while the finger is
/// down, and the release either springs it back to rest or carries it the rest
/// of the way out and calls `onClose` mid-flight — the mask fades against a
/// sheet already on its way down rather than after a jump back to the top.
export const useSheetSwipeHook = (onClose: () => void, enabled: boolean) => {
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLElement | null>(null);
  const startY = useRef(0);
  const startedAt = useRef(0);
  const travel = useRef(0);
  const dragging = useRef(false);
  const resetTimer = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      window.clearTimeout(resetTimer.current);
    },
    [],
  );

  /// Resolved on first touch rather than on mount: the drawer portals to
  /// <body>, so the wrapper is only an ancestor once the sheet is open.
  const sheet = () => {
    if (!wrapperRef.current) {
      wrapperRef.current =
        anchorRef.current?.closest<HTMLElement>(".ant-drawer-content-wrapper") ?? null;
    }
    return wrapperRef.current;
  };

  const onTouchStart = useCallback(
    (event: ReactTouchEvent<HTMLDivElement>) => {
      const touch = event.touches[0];
      if (!enabled || !touch) return;

      const element = sheet();
      if (!element) return;

      window.clearTimeout(resetTimer.current);
      dragging.current = true;
      travel.current = 0;
      startY.current = touch.clientY;
      startedAt.current = event.timeStamp;
      element.style.transition = "none";
    },
    [enabled],
  );

  const onTouchMove = useCallback((event: ReactTouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    const element = wrapperRef.current;
    if (!dragging.current || !touch || !element) return;

    // Upward drag is resisted rather than followed — the sheet is already at
    // its top, and letting it lift would tear it off the screen edge.
    const delta = touch.clientY - startY.current;
    travel.current = delta > 0 ? delta : delta / 4;
    element.style.transform = `translate3d(0, ${Math.max(travel.current, -24)}px, 0)`;
  }, []);

  const onTouchEnd = useCallback(
    (event: ReactTouchEvent<HTMLDivElement>) => {
      const element = wrapperRef.current;
      if (!dragging.current || !element) return;

      dragging.current = false;
      const elapsed = Math.max(event.timeStamp - startedAt.current, 1);
      const velocity = travel.current / elapsed;
      element.style.transition = SETTLE_EASE;

      if (travel.current > DISMISS_DISTANCE || velocity > DISMISS_VELOCITY) {
        element.style.transform = "translate3d(0, 100%, 0)";
        onClose();
      } else {
        element.style.transform = "translate3d(0, 0, 0)";
      }

      // Handed back to antd once the motion has played, so the next open is
      // animated by the drawer itself and not pinned by a stale inline style.
      resetTimer.current = window.setTimeout(() => {
        element.style.transition = "";
        element.style.transform = "";
        wrapperRef.current = null;
      }, 320);
    },
    [onClose],
  );

  return {
    anchorRef,
    /// Spread onto the region that should answer to the gesture — the grip and
    /// the header above the scrolling options, never the options themselves.
    swipeHandlers: enabled
      ? { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel: onTouchEnd }
      : {},
  };
};
