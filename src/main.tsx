import "@ant-design/v5-patch-for-react-19";
// Leaflet draws its tiles, controls and attribution from its own stylesheet.
// Imported here rather than beside the map component because vanilla-extract
// owns every *.css.ts in the app and this is a plain vendor sheet.
import "leaflet/dist/leaflet.css";
import "./styles/common/global.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
