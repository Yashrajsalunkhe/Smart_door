import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { DoorbellProvider } from "./context/DoorbellContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

// Material Icons
const materialIcons = document.createElement('link');
materialIcons.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
materialIcons.rel = 'stylesheet';
document.head.appendChild(materialIcons);

// Inter font
const interFont = document.createElement('link');
interFont.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
interFont.rel = 'stylesheet';
document.head.appendChild(interFont);

// Update document title
document.title = "Smart Doorbell System";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <DoorbellProvider>
      <App />
    </DoorbellProvider>
  </QueryClientProvider>
);
