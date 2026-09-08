import { App } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  cityZoom,
  davaoCenter,
  isInsideDavao,
  pinnedZoom,
} from "../../../constants/map.constants";

/// Nominatim asks for no more than one request a second. This is comfortably
/// inside that, and the lookup is a convenience anyway — the pin is what the
/// order is placed against, so a failed or rate-limited reverse geocode costs
/// the customer nothing but a line of typing.
const REVERSE_GEOCODE_DELAY = 1200;

interface UseDeliveryLocationArgs {
  lat?: number | null;
  lng?: number | null;
  onChange: (next: { lat: number; lng: number; address?: string }) => void;
}

/// The map field's behaviour: find me, drop a pin, name the place it landed.
///
/// The coordinates are authoritative. The address is a convenience the customer
/// may overwrite at will — a rider needs "blue gate beside the sari-sari store"
/// far more than a formally correct street name.
export const useDeliveryLocationHook = ({
  lat,
  lng,
  onChange,
}: UseDeliveryLocationArgs) => {
  const { message } = App.useApp();
  const [isLocating, setIsLocating] = useState(false);
  const [isNaming, setIsNaming] = useState(false);

  const timer = useRef<number | null>(null);
  const abort = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
      abort.current?.abort();
    },
    [],
  );

  /// Names a coordinate, debounced, and never throws: OpenStreetMap's public
  /// geocoder is free and therefore rate-limited and occasionally down.
  const nameLocation = useCallback(
    (nextLat: number, nextLng: number) => {
      if (timer.current) window.clearTimeout(timer.current);
      abort.current?.abort();

      timer.current = window.setTimeout(async () => {
        const controller = new AbortController();
        abort.current = controller;
        setIsNaming(true);

        try {
          const url = new URL("https://nominatim.openstreetmap.org/reverse");
          url.searchParams.set("format", "jsonv2");
          url.searchParams.set("zoom", "18");
          url.searchParams.set("lat", String(nextLat));
          url.searchParams.set("lon", String(nextLng));

          const response = await fetch(url, {
            signal: controller.signal,
            headers: { Accept: "application/json" },
          });

          if (!response.ok) return;

          const body = (await response.json()) as { display_name?: string };
          if (body.display_name) {
            onChange({ lat: nextLat, lng: nextLng, address: body.display_name });
          }
        } catch {
          // Aborted, offline, or rate-limited. The pin is set either way.
        } finally {
          setIsNaming(false);
        }
      }, REVERSE_GEOCODE_DELAY);
    },
    [onChange],
  );

  const setPin = useCallback(
    (nextLat: number, nextLng: number) => {
      // The map cannot be panned or clicked outside the city, so this only
      // catches a coordinate arriving from somewhere else — geolocation, or a
      // restored form value.
      if (!isInsideDavao(nextLat, nextLng)) {
        message.info("We only deliver within Davao City.");
        return;
      }

      onChange({ lat: nextLat, lng: nextLng });
      nameLocation(nextLat, nextLng);
    },
    [onChange, nameLocation, message],
  );

  const locate = useCallback(
    (announce: boolean) => {
      if (!navigator.geolocation) {
        if (announce) message.info("Drop the pin on your address instead.");
        return;
      }

      setIsLocating(true);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          setPin(position.coords.latitude, position.coords.longitude);
        },
        () => {
          setIsLocating(false);
          // Denied, unavailable or timed out — all the same to the customer,
          // and all recoverable by dragging the pin. Silent when the attempt
          // was ours rather than theirs: nobody asked, so nobody is told off.
          if (announce) message.info("Drag the pin to your address.");
        },
        { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
      );
    },
    [message, setPin],
  );

  const locateMe = useCallback(() => locate(true), [locate]);

  // One silent attempt as the field opens, so the common case — ordering from
  // the place you want it delivered — is already pinned and zoomed in by the
  // time the customer looks at the map.
  const autoLocated = useRef(false);
  useEffect(() => {
    if (autoLocated.current) return;
    autoLocated.current = true;

    if (typeof lat === "number" && typeof lng === "number") return;
    locate(false);
    // Deliberately once, on mount: re-running when the pin moves would fight
    // the customer for control of their own map.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasPin = typeof lat === "number" && typeof lng === "number";

  return {
    hasPin,
    center: {
      lat: hasPin ? (lat as number) : davaoCenter.lat,
      lng: hasPin ? (lng as number) : davaoCenter.lng,
    },
    zoom: hasPin ? pinnedZoom : cityZoom,
    isLocating,
    isNaming,
    setPin,
    locateMe,
  };
};
