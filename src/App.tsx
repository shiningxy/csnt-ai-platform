import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "@/components/common/Header";
import { ThemeProvider } from "@/components/theme/theme-provider";
import AlgorithmList from "./pages/AlgorithmList";
import AlgorithmDetail from "./pages/AlgorithmDetail";
import AlgorithmDemo from "./pages/AlgorithmDemo";
import ApprovalCenter from "./pages/ApprovalCenter";
import AdminPanel from "./pages/AdminPanel";
import AlgorithmApply from "./pages/AlgorithmApply";
import NotFound from "./pages/NotFound";

const App = () => (
  <ThemeProvider defaultTheme="system" storageKey="ui-theme">
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen relative">
          <Header />
          <Routes>
            <Route path="/" element={<AlgorithmList />} />
            <Route path="/algorithm/:id" element={<AlgorithmDetail />} />
            <Route path="/algorithm/:id/demo" element={<AlgorithmDemo />} />
            <Route path="/approval" element={<ApprovalCenter />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/apply" element={<AlgorithmApply />} />
            <Route path="/algorithm/apply" element={<AlgorithmApply />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </ThemeProvider>
);

export default App;
