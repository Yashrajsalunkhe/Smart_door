import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import FaceRecognition from "@/pages/FaceRecognition";
import FaceManagement from "@/pages/FaceManagement";
import History from "@/pages/History";
import Settings from "@/pages/Settings";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import { useTheme } from "@/hooks/use-theme";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/recognition" component={FaceRecognition} />
      <Route path="/management" component={FaceManagement} />
      <Route path="/history" component={History} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { isDarkMode } = useTheme();

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#121212] text-gray-800 dark:text-gray-200">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-[#121212]">
            <Router />
          </main>
        </div>
      </div>
      <MobileNav />
      <Toaster />
    </div>
  );
}

export default App;
