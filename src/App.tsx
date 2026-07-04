import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import PortalHome from "./pages/PortalHome.tsx";
import Index from "./pages/Index.tsx";
import HazardAnalysis from "./pages/HazardAnalysis.tsx";
import Login from "./pages/Login.tsx";
import DataManagement from "./pages/DataManagement.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PortalHome />} />
          <Route path="/risk-assessment" element={<Index />} />
          <Route path="/hazard-analysis" element={<HazardAnalysis />} />
          <Route path="/login" element={<Login />} />
          <Route path="/data-management" element={<DataManagement />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
