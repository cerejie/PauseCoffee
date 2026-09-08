import { App } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";

/// Where the shop sits, used only as the map's opening view when the customer
/// has not shared a location yet. Metro Manila — near enough that the first
/// pan is short, and it is replaced the moment geolocation answers.
export const defaultMapCenter = { lat: 14.5995, lng: 120.9842 } as const;
export const defaultMapZoom = 13;
export const pinnedMapZoom = 17;

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

/// The map field's behaviour: locate me, drop a pin, and try to name the place
/// the pin landed on.
///
/// The coordinates are authoritative. The address is a convenience that the
/// customer may overwrite at will — a rider needs "blue gate beside the
/// sari-sari store" far more than a formally correct street name.
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
          // Aborted, offline, or rate-limited. The pin is already set and the
          // address box is the customer's to fill in either way.
        } finally {
          setIsNaming(false);
        }
      }, REVERSE_GEOCODE_DELAY);
    },
    [onChange],
  );

  const setPin = useCallback(
    (nextLat: number, nextLng: number) => {
      onChange({ lat: nextLat, lng: nextLng });
      nameLocation(nextLat, nextLng);
    },
    [onChange, nameLocation],
  );

  const locateMe = useCallback(() => {
    if (!navigator.geolocation) {
      message.info("This browser can't share your location. Drop the pin instead.");
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
        // Denied, unavailable, or timed out — all the same to the customer,
        // and all recoverable by dragging the pin.
        message.info("We couldn't get your location. Drag the pin to your address.");
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  }, [message, setPin]);

  return {
    hasPin: typeof lat === "number" && typeof lng === "number",
    center: {
      lat: typeof lat === "number" ? lat : defaultMapCenter.lat,
      lng: typeof lng === "number" ? lng : defaultMapCenter.lng,
    },
    zoom: typeof lat === "number" ? pinnedMapZoom : defaultMapZoom,
    isLocating,
    isNaming,
    setPin,
    locateMe,
  };
};
