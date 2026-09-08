import { useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import { defaultOnlineSlug } from "../../../constants/online.constants";

/// Which app is on screen, and where its links point.
///
/// The channel is derived from the route rather than stored: there is exactly
/// one truth — the URL — so an online cart and an in-store cart can never
/// disagree about which one the customer is in. The slug comes from the route
/// param, which OnlineGuard has already checked against the settings row, so
/// anything reading this is inside a verified online route.
export const useOnlineChannelHook = () => {
  const { onlineSlug } = useParams<{ onlineSlug: string }>();
  const location = useLocation();

  return useMemo(() => {
    const slug = onlineSlug ?? defaultOnlineSlug;
    const basePath = `/${slug}`;

    return {
      slug,
      basePath,
      cartPath: `${basePath}/cart`,
      /// True on every screen under the online slug. The in-store app at "/"
      /// never sees this hook, so it is really only useful to shared
      /// components that render in both.
      isOnline: location.pathname.startsWith(basePath),
    };
  }, [onlineSlug, location.pathname]);
};
