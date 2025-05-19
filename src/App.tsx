
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Index from "./pages/Index";
import NovoAtendimento from "./pages/NovoAtendimento";
import EditarAtendimento from "./pages/EditarAtendimento";
import AnaliseFrequencial from "./pages/AnaliseFrequencial";
import ListagemTarot from "./pages/ListagemTarot";
import EditarAnaliseFrequencial from "./pages/EditarAnaliseFrequencial";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { ThemeProvider } from "./components/theme-provider";
import Footer from "./components/Footer";

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/novo-atendimento" element={
              <ProtectedRoute>
                <NovoAtendimento />
              </ProtectedRoute>
            } />
            <Route path="/editar-atendimento/:id" element={
              <ProtectedRoute>
                <EditarAtendimento />
              </ProtectedRoute>
            } />
            <Route path="/analise-frequencial" element={
              <ProtectedRoute>
                <AnaliseFrequencial />
              </ProtectedRoute>
            } />
            <Route path="/listagem-tarot" element={
              <ProtectedRoute>
                <ListagemTarot />
              </ProtectedRoute>
            } />
            <Route path="/editar-analise-frequencial/:id" element={
              <ProtectedRoute>
                <EditarAnaliseFrequencial />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

function App() {
  const [queryClient] = useState(() => new QueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
