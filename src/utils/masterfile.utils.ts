/// Masterfile rows are ordered by a `sort_order` the admin no longer types —
/// a new row simply goes to the end of its list. Kept in one place because the
/// category, size and add-on forms all had the same field and all dropped it.
export const nextSortOrder = (rows: readonly { sort_order: number }[]): number =>
  rows.reduce((highest, row) => Math.max(highest, row.sort_order), 0) + 1;

/// A category's slug is what the customer menu anchors and scrolls to, so it
/// has to be unique. It is derived from the name rather than asked for, which
/// means two categories called the same thing have to be told apart here.
export const uniqueSlug = (base: string, taken: Iterable<string>): string => {
  const used = new Set(taken);
  const stem = base || "category";

  if (!used.has(stem)) return stem;

  let suffix = 2;
  while (used.has(`${stem}-${suffix}`)) suffix += 1;
  return `${stem}-${suffix}`;
};
