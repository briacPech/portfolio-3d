import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import Routing from "./Routing";

const container = document.getElementById("app");
const root = createRoot(container!);

root.render(
  <HelmetProvider>
    <Routing />
  </HelmetProvider>
);
