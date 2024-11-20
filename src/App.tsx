import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Index from "./pages/Index";
import Solution from "./pages/Solution";
import Dashboard from "./pages/admin/Dashboard";
import Login from "./pages/admin/Login";
import Metrics from "./pages/admin/Metrics";
import Solutions from "./pages/admin/Solutions";
import Orders from "./pages/admin/Orders";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-[#1C1C1C]">
          <Routes>
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin/dashboard" element={<Dashboard />}>
              <Route path="metrics" element={<Metrics />} />
              <Route path="solutions" element={<Solutions />} />
              <Route path="orders" element={<Orders />} />
            </Route>
            <Route
              path="/"
              element={
                <>
                  <Header />
                  <main>
                    <Routes>
                      <Route index element={<Index />} />
                      <Route path="/solution/:id" element={<Solution />} />
                    </Routes>
                  </main>
                </>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;