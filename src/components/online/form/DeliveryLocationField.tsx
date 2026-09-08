import { AimOutlined, LoadingOutlined } from "@ant-design/icons";
import { Button, Form, Input, type FormInstance } from "antd";
import L from "leaflet";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { useDeliveryLocationHook } from "../../../hook/data/online/delivery.location.hook";
import type { IOnlineCheckoutFormRequest } from "../../../models/data/order/order.request";
import {
  coordChip,
  mapActions,
  mapFrame,
  mapHint,
  pin as pinClass,
} from "../../../styles/online/map.css";
import { fieldLabel } from "../../../styles/cart/cart.css";
import { sectionHint } from "../../../styles/online/online.css";

/// A CSS pin instead of Leaflet's default marker image. Leaflet resolves its
/// icon PNGs relative to the stylesheet, which breaks under a bundler — the
/// well-known "missing marker" bug — and a div we style ourselves is on-brand
/// and costs no requests.
const pinIcon = L.divIcon({
  className: "",
  html: `<div class="${pinClass}"></div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 26],
});

/// Recenters only when the pin lands outside what is already on screen.
///
/// That one condition replaces a pile of "did this come from a drag or from
/// geolocation" bookkeeping: dragging the marker keeps it inside the viewport
/// so the map holds still, while Locate me usually jumps somewhere else
/// entirely and the map follows.
const RecenterOnJump = ({
  lat,
  lng,
  zoom,
}: {
  lat?: number | null;
  lng?: number | null;
  zoom: number;
}) => {
  const map = useMap();

  useEffect(() => {
    if (typeof lat !== "number" || typeof lng !== "number") return;

    const point = L.latLng(lat, lng);
    if (!map.getBounds().contains(point)) map.setView(point, zoom);
  }, [lat, lng, zoom, map]);

  return null;
};

const ClickToPin = ({ onPick }: { onPick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click: (event) => onPick(event.latlng.lat, event.latlng.lng),
  });
  return null;
};

interface DeliveryLocationFieldProps {
  form: FormInstance<IOnlineCheckoutFormRequest>;
}

/// Where to deliver. The pin is what the order actually carries — the address
/// box is for the rider to read, and the customer may write whatever gets them
/// found, which is usually a landmark rather than a street number.
const DeliveryLocationField = ({ form }: DeliveryLocationFieldProps) => {
  const lat = Form.useWatch("delivery_lat", form);
  const lng = Form.useWatch("delivery_lng", form);

  // What the geocoder last wrote. If the address box still holds exactly that,
  // it is ours to replace; the moment the customer edits it, it is theirs and
  // moving the pin must not overwrite their words.
  const lastGeocoded = useRef<string | null>(null);

  const handleChange = useCallback(
    (next: { lat: number; lng: number; address?: string }) => {
      form.setFieldsValue({ delivery_lat: next.lat, delivery_lng: next.lng });
      // Clear the "drop a pin" error the moment one exists.
      void form.validateFields(["delivery_lat"]).catch(() => undefined);

      if (!next.address) return;

      const current = form.getFieldValue("delivery_address") as string | undefined;
      if (!current?.trim() || current === lastGeocoded.current) {
        lastGeocoded.current = next.address;
        form.setFieldsValue({ delivery_address: next.address });
      }
    },
    [form],
  );

  const { center, zoom, hasPin, isLocating, isNaming, setPin, locateMe } =
    useDeliveryLocationHook({ lat, lng, onChange: handleChange });

  const markerHandlers = useMemo(
    () => ({
      dragend: (event: L.DragEndEvent) => {
        const { lat: nextLat, lng: nextLng } = (
          event.target as L.Marker
        ).getLatLng();
        setPin(nextLat, nextLng);
      },
    }),
    [setPin],
  );

  return (
    <div>
      <div className={mapFrame}>
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={zoom}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            // OpenStreetMap's own tiles: free, no key, no account. The
            // attribution below is required by their tile usage policy, not
            // decoration — do not remove it.
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
          <ClickToPin onPick={setPin} />
          <RecenterOnJump lat={lat} lng={lng} zoom={zoom} />
          {hasPin ? (
            <Marker
              position={[center.lat, center.lng]}
              icon={pinIcon}
              draggable
              eventHandlers={markerHandlers}
            />
          ) : null}
        </MapContainer>
      </div>

      <div className={mapActions}>
        <Button
          icon={isLocating ? <LoadingOutlined /> : <AimOutlined />}
          onClick={locateMe}
          disabled={isLocating}
        >
          {isLocating ? "Finding you…" : "Use my location"}
        </Button>

        {hasPin ? (
          <span className={coordChip}>
            {Number(lat).toFixed(5)}, {Number(lng).toFixed(5)}
          </span>
        ) : null}

        {isNaming ? <span className={mapHint}>Looking up the address…</span> : null}
      </div>

      <p className={mapHint}>
        Tap the map or drag the pin to exactly where you want it delivered.
      </p>

      {/* Hidden controls, but not hidden Form.Items — the required message has
          to render somewhere, and this is where a missing pin is explained. */}
      <Form.Item
        name="delivery_lat"
        style={{ marginBottom: 0, marginTop: 4 }}
        rules={[{ required: true, message: "Drop a pin so we know where to deliver." }]}
      >
        <Input type="hidden" />
      </Form.Item>
      <Form.Item name="delivery_lng" hidden>
        <Input type="hidden" />
      </Form.Item>

      <div style={{ marginTop: 14 }}>
        <label className={fieldLabel} htmlFor="delivery_address">
          Delivery address
        </label>
        <Form.Item
          name="delivery_address"
          style={{ marginBottom: 12 }}
          rules={[
            { required: true, message: "We need an address to hand the rider." },
            { whitespace: true, message: "We need an address to hand the rider." },
          ]}
        >
          <Input.TextArea
            id="delivery_address"
            rows={2}
            maxLength={240}
            placeholder="House or unit number, street, barangay"
          />
        </Form.Item>
      </div>

      <div>
        <label className={fieldLabel} htmlFor="delivery_landmark">
          Landmark <span style={{ fontWeight: 500 }}>(optional)</span>
        </label>
        <Form.Item name="delivery_landmark" style={{ marginBottom: 0 }}>
          <Input
            id="delivery_landmark"
            maxLength={120}
            placeholder="e.g. blue gate beside the sari-sari store"
          />
        </Form.Item>
        <p className={sectionHint} style={{ marginTop: 6, marginBottom: 0 }}>
          This is usually what actually gets a rider to your door.
        </p>
      </div>
    </div>
  );
};

export default DeliveryLocationField;
