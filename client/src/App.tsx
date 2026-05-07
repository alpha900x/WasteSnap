import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import MapView from "@/pages/MapView";
import ReportForm from "@/pages/ReportForm";
import MyReports from "@/pages/MyReports";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/report" component={ReportForm} />
        <Route path="/my-reports" component={MyReports} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/landing" component={Landing} />
        <Route path="/app" component={MapView} />
        <Route path="/login" component={Login} />
        <Route component={NotFound} />
        <Route path="/signup" component={Signup} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
