
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Users, Activity, FileText, Pencil, Trash2 } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";
import UserMenu from "@/components/UserMenu";
import useUserDataService from "@/services/userDataService";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getAtendimentos, saveAtendimentos } = useUserDataService();
  const [atendimentos, setAtendimentos] = useState([]);
  const [totalRecebido, setTotalRecebido] = useState(0);
  const [atendimentosSemana, setAtendimentosSemana] = useState(0);
  const [periodoVisualizacao, setPeriodoVisualizacao] = useState("semana");
  const [atendimentoParaExcluir, setAtendimentoParaExcluir] = useState(null);

  useEffect(() => {
    // Load user's atendimentos from storage service
    const regularAtendimentos = getAtendimentos().filter(atendimento => 
      atendimento.tipoServico !== "tarot-frequencial"
    );
    
    setAtendimentos(regularAtendimentos);
    
    // Calculate total revenue based on selected period
    calcularTotalPeriodo(regularAtendimentos, periodoVisualizacao);
    
    // Calculate appointments this week
    calcularAtendimentosSemana(regularAtendimentos);
  }, [periodoVisualizacao]);

  const calcularTotalPeriodo = (atendimentos, periodo) => {
    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999);
    
    let dataInicio = new Date(hoje);
    
    // Define o período de início com base na seleção
    switch(periodo) {
      case "dia":
        dataInicio.setHours(0, 0, 0, 0);
        break;
      case "semana":
        dataInicio = new Date(hoje);
        dataInicio.setDate(hoje.getDate() - hoje.getDay()); // Start of week (Sunday)
        dataInicio.setHours(0, 0, 0, 0);
        break;
      case "mes":
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        dataInicio.setHours(0, 0, 0, 0);
        break;
      case "ano":
        dataInicio = new Date(hoje.getFullYear(), 0, 1); // Start of the year (January 1st)
        dataInicio.setHours(0, 0, 0, 0);
        break;
      default:
        dataInicio.setDate(hoje.getDate() - hoje.getDay());
        dataInicio.setHours(0, 0, 0, 0);
    }
    
    // Filter atendimentos by date range and calculate total
    const atendimentosFiltrados = atendimentos.filter(atendimento => {
      const dataAtendimento = new Date(atendimento.dataAtendimento);
      return dataAtendimento >= dataInicio && dataAtendimento <= hoje;
    });
    
    const total = atendimentosFiltrados.reduce((sum, atendimento) => {
      const valor = parseFloat(atendimento.valor) || 0;
      return sum + valor;
    }, 0);
    
    setTotalRecebido(total);
  };

  const calcularAtendimentosSemana = (atendimentos) => {
    const hoje = new Date();
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay()); // Start of week (Sunday)
    inicioSemana.setHours(0, 0, 0, 0);
    
    const atendimentosDestaSemana = atendimentos.filter(atendimento => {
      const dataAtendimento = new Date(atendimento.dataAtendimento);
      return dataAtendimento >= inicioSemana && dataAtendimento <= hoje;
    });
    
    setAtendimentosSemana(atendimentosDestaSemana.length);
  };

  const getPeriodoLabel = () => {
    switch(periodoVisualizacao) {
      case "dia":
        return "Hoje";
      case "semana":
        return "Esta Semana";
      case "mes":
        return "Este Mês";
      case "ano":
        return "Este Ano";
      default:
        return "Esta Semana";
    }
  };

  const handleEditAtendimento = (id) => {
    navigate(`/editar-atendimento/${id}`);
  };

  const handleExcluirAtendimento = () => {
    if (atendimentoParaExcluir) {
      const allAtendimentos = getAtendimentos();
      const updatedAtendimentos = allAtendimentos.filter(
        (atendimento) => atendimento.id !== atendimentoParaExcluir
      );
      
      // Save to user's storage
      saveAtendimentos(updatedAtendimentos);
      
      // Update state (only regular atendimentos)
      const regularAtendimentos = updatedAtendimentos.filter(atendimento => 
        atendimento.tipoServico !== "tarot-frequencial"
      );
      setAtendimentos(regularAtendimentos);
      
      // Recalculate totals
      calcularTotalPeriodo(regularAtendimentos, periodoVisualizacao);
      calcularAtendimentosSemana(regularAtendimentos);
      
      // Reset the atendimento to exclude
      setAtendimentoParaExcluir(null);
      
      // Show success toast
      toast({
        title: "Atendimento excluído",
        description: "O atendimento foi excluído com sucesso.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-md py-4 px-6 border-b border-blue-100">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo height={70} width={70} />
            <h1 className="text-2xl font-bold text-[#0EA5E9]">
              Libertá - Sistema de Atendimentos
            </h1>
          </div>
          <div className="flex gap-2 items-center">
            <Button 
              variant="outline" 
              className="border-[#0EA5E9] text-[#0EA5E9] hover:bg-blue-50"
              onClick={() => navigate('/listagem-tarot')}
            >
              Tarot Frequencial
            </Button>
            <Button 
              className="bg-[#0EA5E9] hover:bg-[#0284C7] transition-all duration-300"
              onClick={() => navigate('/novo-atendimento')}
            >
              Novo Atendimento
            </Button>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-700">Visão Geral</h2>
          <div className="bg-white rounded-md shadow-sm">
            <ToggleGroup 
              type="single" 
              value={periodoVisualizacao} 
              onValueChange={(value) => {
                if (value) setPeriodoVisualizacao(value);
              }}
              className="border rounded-md overflow-hidden"
            >
              <ToggleGroupItem value="dia" className="data-[state=on]:bg-[#0EA5E9] data-[state=on]:text-white px-4">
                Dia
              </ToggleGroupItem>
              <ToggleGroupItem value="semana" className="data-[state=on]:bg-[#0EA5E9] data-[state=on]:text-white px-4">
                Semana
              </ToggleGroupItem>
              <ToggleGroupItem value="mes" className="data-[state=on]:bg-[#0EA5E9] data-[state=on]:text-white px-4">
                Mês
              </ToggleGroupItem>
              <ToggleGroupItem value="ano" className="data-[state=on]:bg-[#0EA5E9] data-[state=on]:text-white px-4">
                Ano
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard 
            title="Atendimentos" 
            value={atendimentos.length.toString()} 
            icon={<Users className="h-8 w-8 text-[#0EA5E9]" />} 
          />
          <DashboardCard 
            title="Esta Semana" 
            value={atendimentosSemana.toString()}
            icon={<CalendarDays className="h-8 w-8 text-[#0EA5E9]" />} 
          />
          <DashboardCard 
            title={`Recebido (${getPeriodoLabel()})`}
            value={`R$ ${totalRecebido.toFixed(2)}`} 
            icon={<Activity className="h-8 w-8 text-[#0EA5E9]" />} 
          />
          <DashboardCard 
            title="Análises Frequenciais" 
            value="0" 
            icon={<FileText className="h-8 w-8 text-[#0EA5E9]" />} 
          />
        </div>

        <Card className="border-blue-100 shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
            <CardTitle className="text-[#0EA5E9]">Atendimentos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {atendimentos.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-[#0EA5E9]">Nome</th>
                      <th className="text-left py-3 px-4 text-[#0EA5E9]">Data</th>
                      <th className="text-left py-3 px-4 text-[#0EA5E9]">Serviço</th>
                      <th className="text-right py-3 px-4 text-[#0EA5E9]">Valor</th>
                      <th className="text-center py-3 px-4 text-[#0EA5E9]">Atenção</th>
                      <th className="text-center py-3 px-4 text-[#0EA5E9]">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {atendimentos.map((atendimento) => (
                      <tr key={atendimento.id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                        <td className="py-3 px-4">{atendimento.nome}</td>
                        <td className="py-3 px-4">
                          {atendimento.dataAtendimento ? new Date(atendimento.dataAtendimento).toLocaleDateString('pt-BR') : ''}
                        </td>
                        <td className="py-3 px-4 capitalize">{atendimento.tipoServico.replace('-', ' ')}</td>
                        <td className="py-3 px-4 text-right">R$ {parseFloat(atendimento.valor || 0).toFixed(2)}</td>
                        <td className="py-3 px-4 text-center">
                          {atendimento.atencaoFlag ? (
                            <div className="inline-flex items-center bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                              ATENÇÃO
                            </div>
                          ) : null}
                        </td>
                        <td className="py-3 px-4 text-center flex justify-center gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-[#0EA5E9] hover:bg-blue-100 hover:text-[#0284C7]"
                            onClick={() => handleEditAtendimento(atendimento.id)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-red-500 hover:bg-red-50 hover:text-red-600"
                                onClick={() => setAtendimentoParaExcluir(atendimento.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir Atendimento</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir este atendimento? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setAtendimentoParaExcluir(null)}>
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleExcluirAtendimento}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-6">
                  <Logo height={80} width={80} />
                </div>
                <FileText className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-600">Nenhum atendimento encontrado</h3>
                <p className="text-gray-500 mt-2">Clique em "Novo Atendimento" para começar</p>
                <Button 
                  className="mt-6 bg-[#0EA5E9] hover:bg-[#0284C7] transition-all duration-300"
                  onClick={() => navigate('/novo-atendimento')}
                >
                  Novo Atendimento
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

const DashboardCard = ({ title, value, icon }) => (
  <Card className="border-blue-100 shadow-md hover:shadow-lg transition-all duration-300">
    <CardContent className="pt-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="rounded-full p-2 bg-blue-50">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default Index;
