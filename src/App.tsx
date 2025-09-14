import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "@/components/common/Header";
import { ThemeProvider } from "@/components/theme/theme-provider";
import Silk from "@/components/effects/Silk";
import AlgorithmList from "./pages/AlgorithmList";
import AlgorithmDetail from "./pages/AlgorithmDetail";
import ApprovalCenter from "./pages/ApprovalCenter";
import AdminPanel from "./pages/AdminPanel";
import AlgorithmApply from "./pages/AlgorithmApply";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="relative min-h-screen">
            {/* Global Silk Background */}
            <div className="fixed inset-0 z-0">
              <Silk
                speed={6}
                scale={1}
                color="#409eff"
                noiseIntensity={1.5}
                rotation={0}
              />
            </div>
            
            {/* Main Content */}
            <div className="relative z-10 min-h-screen bg-background/80 backdrop-blur-sm">
              <Header />
              <Routes>
                <Route path="/" element={<AlgorithmList />} />
                <Route path="/algorithm/:id" element={<AlgorithmDetail />} />
                <Route path="/approval" element={<ApprovalCenter />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/apply" element={<AlgorithmApply />} />
                <Route path="/algorithm/apply" element={<AlgorithmApply />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
