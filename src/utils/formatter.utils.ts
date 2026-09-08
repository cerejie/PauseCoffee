import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/// Prices on the menu are whole pesos; only show centavos when there are any.
export const formatPeso = (value: number | string | null | undefined): string => {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return peso.format(0);
  return peso.format(amount);
};

export const formatDateTime = (value: string | null | undefined): string =>
  value ? dayjs(value).format("MMM D, YYYY h:mm A") : "—";

export const formatTime = (value: string | null | undefined): string =>
  value ? dayjs(value).format("h:mm A") : "—";

/// Minutes since the ticket was placed — the queue board's urgency signal.
export const minutesSince = (value: string | null | undefined): number =>
  value ? Math.max(0, dayjs().diff(dayjs(value), "minute")) : 0;

export const formatElapsed = (value: string | null | undefined): string => {
  if (!value) return "—";
  const mins = minutesSince(value);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
};

export const dash = (value: string | number | null | undefined): string =>
  value === null || value === undefined || value === "" ? "—" : String(value);

/// URL-safe key for a category. The customer menu scrolls to `#section-<slug>`,
/// so it has to survive whatever the admin typed as a name.
export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

/// One or two letters for a monogram. Falls back to a bullet rather than an
/// empty circle, because a name is only ever missing when something upstream
/// went wrong and a blank avatar hides that.
export const initialsOf = (value: string | null | undefined): string => {
  const words = (value ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "•";

  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return `${first}${last}`.toUpperCase();
};
