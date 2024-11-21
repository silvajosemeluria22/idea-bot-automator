import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Index from "./pages/Index";
import Solution from "./pages/Solution";
import Dashboard from "./pages/admin/Dashboard";
import Login from "./pages/admin/Login";
import Metrics from "./pages/admin/Metrics";
import Solutions from "./pages/admin/Solutions";
import SolutionView from "./pages/admin/SolutionView";
import Orders from "./pages/admin/Orders";

const queryClient = new QueryClient();

// Wrapper component to handle conditional header rendering
const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-[#1C1C1C]">
      {!isAdminRoute && <Header />}
      <Routes>
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/dashboard" element={<Dashboard />}>
          <Route path="metrics" element={<Metrics />} />
          <Route path="solutions" element={<Solutions />} />
          <Route path="solutions/:id" element={<SolutionView />} />
          <Route path="orders" element={<Orders />} />
        </Route>
        <Route path="/" element={<Index />} />
        <Route path="/solution/:id" element={<Solution />} />
      </Routes>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;