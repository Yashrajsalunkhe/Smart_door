import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import * as faceapi from "face-api.js";
import { loadModels } from "@/lib/face-api";

// Create models directory and load models when app starts
const initializeApplication = async () => {
  // Always render the application immediately to avoid blank screen
  createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster />
    </QueryClientProvider>
  );
  
  try {
    // Start the model loading process in the background
    // This allows the UI to load while models are being prepared
    const modelLoadSuccess = await loadModels();
    
    if (modelLoadSuccess) {
      console.log("Face recognition models initialized successfully");
    } else {
      console.warn("Face recognition initialization did not complete successfully");
      console.info("The application will still function, but face recognition features may be limited");
    }
  } catch (error) {
    console.error("Error during application initialization:", error);
  }
};

// Start the application
initializeApplication();
