import { Switch, Route } from "wouter";
import Dashboard from "@/pages/Dashboard";
import FaceRecognition from "@/pages/FaceRecognition";
import FaceManagement from "@/pages/FaceManagement";
import History from "@/pages/History";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";
import AppLayout from "@/components/layout/AppLayout";

function App() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/face-recognition" component={FaceRecognition} />
        <Route path="/face-management" component={FaceManagement} />
        <Route path="/history" component={History} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

export default App;
