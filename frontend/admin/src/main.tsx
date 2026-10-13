import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { startPwa } from "./app/pwa/pwa";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(<App />);
// Installable app: service worker, install offer, offline and update notices (src/app/pwa/pwa.ts).
startPwa();
