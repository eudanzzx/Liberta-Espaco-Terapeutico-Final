
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import NovoAtendimento from "./pages/NovoAtendimento";
import EditarAtendimento from "./pages/EditarAtendimento";
import AnaliseFrequencial from "./pages/AnaliseFrequencial";
import ListagemTarot from "./pages/ListagemTarot";
import EditarAnaliseFrequencial from "./pages/EditarAnaliseFrequencial";
import NotFound from "./pages/NotFound";
import RelatorioGeral from "./pages/RelatorioGeral";
import RelatorioIndividual from "./pages/RelatorioIndividual";
import RelatoriosFinanceiros from "./pages/RelatoriosFinanceiros";
import RelatoriosFrequencial from "./pages/RelatoriosFrequencial";
import Footer from "./components/Footer";
import { ThemeProvider } from "./components/theme-provider";

function AppRoutes() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/novo-atendimento" element={<NovoAtendimento />} />
            <Route path="/editar-atendimento/:id" element={<EditarAtendimento />} />
            <Route path="/analise-frequencial" element={<AnaliseFrequencial />} />
            <Route path="/listagem-tarot" element={<ListagemTarot />} />
            <Route path="/editar-analise-frequencial/:id" element={<EditarAnaliseFrequencial />} />
            <Route path="/relatorio-geral" element={<RelatorioGeral />} />
            <Route path="/relatorio-individual/:id" element={<RelatorioIndividual />} />
            <Route path="/relatorios-financeiros" element={<RelatoriosFinanceiros />} />
            <Route path="/relatorios-frequencial" element={<RelatoriosFrequencial />} />
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
