import { style } from "@vanilla-extract/css";
import {
  colorBorderSoft,
  colorCanvas,
  colorEspresso,
  colorPrimary,
  colorSurface,
  colorTextHeading,
  colorTextMuted,
  fontDisplay,
  radiusLg,
  radiusPill,
  shadowLifted,
} from "../common/vars.css";

export const shell = style({
  minHeight: "100dvh",
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  backgroundColor: colorCanvas,
  "@media": {
    "screen and (max-width: 860px)": { gridTemplateColumns: "1fr" },
  },
});

/// Espresso brand panel — hidden on phones, where the form is the whole screen.
export const brandPane = style({
  position: "relative",
  overflow: "hidden",
  padding: "56px 52px",
  backgroundColor: colorEspresso,
  color: "#F3E9DA",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  backgroundImage:
    "radial-gradient(90% 60% at 10% 0%, rgba(233,161,59,0.28), transparent 62%)",
  "@media": {
    "screen and (max-width: 860px)": { display: "none" },
  },
});

export const brandTop = style({
  display: "flex",
  alignItems: "center",
  gap: 12,
});

export const brandHeadline = style({
  fontFamily: fontDisplay,
  fontSize: 42,
  fontWeight: 600,
  lineHeight: 1.1,
  letterSpacing: "-0.025em",
  maxWidth: 420,
  margin: 0,
});

export const brandCopy = style({
  marginTop: 16,
  fontSize: 15,
  lineHeight: 1.65,
  opacity: 0.72,
  maxWidth: 400,
});

export const brandFoot = style({
  fontSize: 12,
  opacity: 0.45,
  letterSpacing: "0.04em",
});

// ---------------------------------------------------------------- form pane

export const formPane = style({
  display: "grid",
  placeItems: "center",
  padding: 24,
});

export const card = style({
  width: "100%",
  maxWidth: 400,
  padding: "34px 30px",
  borderRadius: radiusLg,
  border: `1px solid ${colorBorderSoft}`,
  backgroundColor: colorSurface,
  boxShadow: shadowLifted,
});

export const cardTitle = style({
  fontFamily: fontDisplay,
  fontSize: 27,
  fontWeight: 600,
  color: colorTextHeading,
  letterSpacing: "-0.02em",
  margin: 0,
});

export const cardSub = style({
  marginTop: 7,
  marginBottom: 26,
  fontSize: 13.5,
  color: colorTextMuted,
  lineHeight: 1.55,
});

export const submit = style({
  width: "100%",
  height: 48,
  borderRadius: radiusPill,
  border: "none",
  backgroundColor: colorPrimary,
  color: colorEspresso,
  fontSize: 15,
  fontWeight: 700,
  cursor: "pointer",
  transition: "filter .16s ease",
  selectors: {
    "&:hover:not(:disabled)": { filter: "brightness(1.05)" },
    "&:disabled": { opacity: 0.6, cursor: "not-allowed" },
  },
});

export const backHome = style({
  display: "block",
  marginTop: 20,
  textAlign: "center",
  fontSize: 13,
  fontWeight: 600,
  color: colorTextMuted,
  textDecoration: "none",
  selectors: { "&:hover": { color: colorTextHeading } },
});
