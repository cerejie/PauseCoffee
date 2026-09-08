/// The shop delivers inside Davao City and nowhere else, so the map is not a
/// map of the world that happens to open there — it cannot be panned, zoomed
/// or pinned outside the city at all.
///
/// These bounds are the client half of the rule. Migration 0019 puts the same
/// box on the orders table, because a hand-rolled request with the anon key
/// does not go anywhere near this file.

export const davaoCenter = { lat: 7.0731, lng: 125.6128 } as const;

/// Roughly Davao City's administrative area — Marilog and Paquibato in the
/// north-west, Toril and Sirawan in the south, the gulf on the east. Generous
/// rather than tight: a real address just inside a barangay boundary must not
/// be refused because the box was drawn too small.
export const davaoBounds = {
  south: 6.93,
  west: 125.24,
  north: 7.45,
  east: 125.8,
} as const;

/// Leaflet wants [[south, west], [north, east]].
export const davaoLatLngBounds: [[number, number], [number, number]] = [
  [davaoBounds.south, davaoBounds.west],
  [davaoBounds.north, davaoBounds.east],
];

/// Opens on the city, not on the country. Zoomed far enough in that streets
/// are already legible, so nobody has to pinch their way down from a continent.
export const cityZoom = 13;
/// Where the map lands once a real point is known.
export const pinnedZoom = 17;
/// The whole city fits at 11; below that is somewhere we do not deliver.
export const minZoom = 11;
export const maxZoom = 19;

export const isInsideDavao = (lat: number, lng: number): boolean =>
  lat >= davaoBounds.south &&
  lat <= davaoBounds.north &&
  lng >= davaoBounds.west &&
  lng <= davaoBounds.east;
