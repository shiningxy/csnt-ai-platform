import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "@/components/common/Header";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ProtectedRoute } from "@/components/auth/protected-route";
import AlgorithmList from "./pages/AlgorithmList";
import AlgorithmDetail from "./pages/AlgorithmDetail";
import AlgorithmDemo from "./pages/AlgorithmDemo";
import ApprovalCenter from "./pages/ApprovalCenter";
import AdminPanel from "./pages/AdminPanel";
import AlgorithmApply from "./pages/AlgorithmApply";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const App = () => (
  <ThemeProvider defaultTheme="system" storageKey="ui-theme">
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen relative">
            <Header />
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<AlgorithmList />} />
              <Route path="/algorithm/:id" element={<AlgorithmDetail />} />
              <Route path="/algorithm/:id/demo" element={<AlgorithmDemo />} />
              <Route path="/approval" element={
                <ProtectedRoute requiredRoles={['team_lead', 'admin']}>
                  <ApprovalCenter />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              } />
              <Route path="/apply" element={
                <ProtectedRoute>
                  <AlgorithmApply />
                </ProtectedRoute>
              } />
              <Route path="/algorithm/apply" element={
                <ProtectedRoute>
                  <AlgorithmApply />
                </ProtectedRoute>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
