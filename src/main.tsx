import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker } from "./pwa/registerServiceWorker";

createRoot(document.getElementById("root")!).render(<App />);

// register service worker for PWA support (autoUpdate)
registerServiceWorker();
