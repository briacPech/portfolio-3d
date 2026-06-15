import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import "./index.css";
import Routing from "./Routing";

const container = document.getElementById("app");
const root = createRoot(container!);

root.render(
  <HelmetProvider>
    <Routing />
    <Analytics />
    <SpeedInsights />
  </HelmetProvider>
);
