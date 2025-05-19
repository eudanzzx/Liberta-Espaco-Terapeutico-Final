import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Users, Activity, FileText, Pencil, Trash2, ArrowLeft, BellRing, AlertTriangle, Check, X } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TratamentoCountdown from "@/components/TratamentoCountdown";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ListagemTarot = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [analises, setAnalises] = useState([]);
  const [totalRecebido, setTotalRecebido] = useState(0);
  const [totalAnalises, setTotalAnalises] = useState(0);
  const [analisesSemana, setAnalisesSemana] = useState(0);
  const [periodoVisualizacao, setPeriodoVisualizacao] = useState("semana");
  const [analiseParaExcluir, setAnaliseParaExcluir] = useState(null);
  const [activeTab, setActiveTab] = useState("em-andamento");
  const [analisesFinalizadas, setAnalisesFinalizadas] = useState([]);

  useEffect(() => {
    // Load saved analises from localStorage
    const savedAnalises = JSON.parse(localStorage.getItem("analises") || "[]");
    const finalizadas = savedAnalises.filter(analise => analise.finalizado);
    const emAndamento = savedAnalises.filter(analise => !analise.finalizado);
    
    setAnalises(emAndamento);
    setAnalisesFinalizadas(finalizadas);
    
    // Calculate total revenue based on selected period
    calcularTotalPeriodo(savedAnalises, periodoVisualizacao);
    
    // Calculate analyses this week
    calcularAnalisesSemana(savedAnalises);
    
    // Set total analises
    setTotalAnalises(savedAnalises.length);
    
    // Check for expiring treatments
    checkExpiringTreatments(savedAnalises);
  }, [periodoVisualizacao]);

  const checkExpiringTreatments = (analises) => {
    const hoje = new Date();
    
    analises.forEach(analise => {
      if (!analise.lembretes || !Array.isArray(analise.lembretes)) return;
      
      analise.lembretes.forEach(lembrete => {
        if (!lembrete.texto || !lembrete.dias) return;
        
        const dataInicio = new Date(analise.dataInicio);
        const dataExpiracao = new Date(dataInicio);
        dataExpiracao.setDate(dataExpiracao.getDate() + lembrete.dias);
        
        const diffTime = dataExpiracao.getTime() - hoje.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
        
        // Notificar se estiver expirando em 1 dia ou menos
        if (diffDays <= 1 && diffDays > 0) {
          toast({
            title: "Tratamento expirando em breve",
            description: `"${lembrete.texto}" para ${analise.nomeCliente} expira em ${diffDays} dia (${diffHours} horas)`,
            variant: "default",
          });
        } 
        // Notificar se expirar hoje (apenas em horas)
        else if (diffDays === 0 && diffHours > 0) {
          toast({
            title: "Tratamento expirando hoje",
            description: `"${lembrete.texto}" para ${analise.nomeCliente} expira em ${diffHours} horas`,
            variant: "destructive",
          });
        }
      });
    });
  };

  const calcularTotalPeriodo = (analises, periodo) => {
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
    
    // Filter analises by date range and calculate total
    const analisesFiltrados = analises.filter(analise => {
      const dataAnalise = new Date(analise.dataInicio);
      return dataAnalise >= dataInicio && dataAnalise <= hoje;
    });
    
    // Calculate total revenue using the price field if available
    const total = analisesFiltrados.reduce((sum, analise) => {
      return sum + (Number(analise.preco) || 150); // Use 150 as default if price not available
    }, 0);
    
    setTotalRecebido(total);
  };

  const calcularAnalisesSemana = (analises) => {
    const hoje = new Date();
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay()); // Start of week (Sunday)
    inicioSemana.setHours(0, 0, 0, 0);
    
    const analysesDestaSemana = analises.filter(analise => {
      const dataAnalise = new Date(analise.dataInicio);
      return dataAnalise >= inicioSemana && dataAnalise <= hoje;
    });
    
    setAnalisesSemana(analysesDestaSemana.length);
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

  const handleExcluirAnalise = () => {
    if (analiseParaExcluir) {
      const updatedAnalises = analises.filter(
        (analise) => analise.id !== analiseParaExcluir
      );
      
      // Save to localStorage
      localStorage.setItem("analises", JSON.stringify(updatedAnalises));
      
      // Update state
      setAnalises(updatedAnalises);
      
      // Recalculate totals
      calcularTotalPeriodo(updatedAnalises, periodoVisualizacao);
      calcularAnalisesSemana(updatedAnalises);
      setTotalAnalises(updatedAnalises.length);
      
      // Reset the analise to exclude
      setAnaliseParaExcluir(null);
      
      // Show success toast
      toast({
        title: "Análise excluída",
        description: "A análise de tarot frequencial foi excluída com sucesso.",
        variant: "default",
      });
    }
  };

  const handleEditarAnalise = (id) => {
    navigate(`/editar-analise-frequencial/${id}`);
  };

  const handleMarcarFinalizado = (id) => {
    const updatedAnalises = JSON.parse(localStorage.getItem("analises") || "[]");
    const index = updatedAnalises.findIndex(analise => analise.id === id);
    
    if (index !== -1) {
      updatedAnalises[index].finalizado = true;
      localStorage.setItem("analises", JSON.stringify(updatedAnalises));
      
      // Update state
      const finalizadas = updatedAnalises.filter(analise => analise.finalizado);
      const emAndamento = updatedAnalises.filter(analise => !analise.finalizado);
      
      setAnalises(emAndamento);
      setAnalisesFinalizadas(finalizadas);
      
      toast({
        title: "Análise finalizada",
        description: "A análise foi marcada como finalizada com sucesso.",
        variant: "default",
      });
    }
  };
  
  const handleDesfazerFinalizacao = (id) => {
    const updatedAnalises = JSON.parse(localStorage.getItem("analises") || "[]");
    const index = updatedAnalises.findIndex(analise => analise.id === id);
    
    if (index !== -1) {
      updatedAnalises[index].finalizado = false;
      localStorage.setItem("analises", JSON.stringify(updatedAnalises));
      
      // Update state
      const finalizadas = updatedAnalises.filter(analise => analise.finalizado);
      const emAndamento = updatedAnalises.filter(analise => !analise.finalizado);
      
      setAnalises(emAndamento);
      setAnalisesFinalizadas(finalizadas);
      
      toast({
        title: "Análise reaberta",
        description: "A análise foi movida de volta para 'Em andamento'.",
        variant: "default",
      });
    }
  };

  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const contarLembretes = (lembretes) => {
    if (!lembretes || !Array.isArray(lembretes)) return 0;
    return lembretes.filter(lembrete => lembrete.texto && lembrete.texto.trim()).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-md py-4 px-6 border-b border-blue-100">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo height={70} width={70} />
            <h1 className="text-2xl font-bold text-[#0EA5E9]">
              Libertá - Tarot Frequencial
            </h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-[#0EA5E9] text-[#0EA5E9] hover:bg-blue-50"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
            </Button>
            <Button 
              className="bg-[#0EA5E9] hover:bg-[#0284C7] transition-all duration-300"
              onClick={() => navigate('/analise-frequencial')}
            >
              Nova Análise Frequencial
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4 mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-700">Tarot Frequencial - Visão Geral</h2>
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

        {/* Countdown for expiring treatments */}
        <TratamentoCountdown analises={analises} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard 
            title="Total Análises" 
            value={totalAnalises.toString()} 
            icon={<Users className="h-8 w-8 text-[#0EA5E9]" />} 
          />
          <DashboardCard 
            title="Esta Semana" 
            value={analisesSemana.toString()}
            icon={<CalendarDays className="h-8 w-8 text-[#0EA5E9]" />} 
          />
          <DashboardCard 
            title={`Recebido (${getPeriodoLabel()})`}
            value={`R$ ${totalRecebido.toFixed(2)}`} 
            icon={<Activity className="h-8 w-8 text-[#0EA5E9]" />} 
          />
          <DashboardCard 
            title="Tratamentos" 
            value={analises.reduce((sum, analise) => sum + contarLembretes(analise.lembretes), 0).toString()} 
            icon={<BellRing className="h-8 w-8 text-[#0EA5E9]" />} 
          />
        </div>

        <Card className="border-blue-100 shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
            <CardTitle className="text-[#0EA5E9]">Análises de Tarot Frequencial</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full md:w-80 grid-cols-2 mb-6">
                <TabsTrigger 
                  value="em-andamento"
                  className="data-[state=active]:bg-[#0EA5E9] data-[state=active]:text-white"
                >
                  Em Andamento
                </TabsTrigger>
                <TabsTrigger 
                  value="finalizados"
                  className="data-[state=active]:bg-[#0EA5E9] data-[state=active]:text-white"
                >
                  Finalizados
                </TabsTrigger>
              </TabsList>
              
              {/* Em Andamento Tab */}
              <TabsContent value="em-andamento" className="animate-fade-in">
                {analises.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px] text-center text-[#0EA5E9]"></TableHead>
                        <TableHead className="text-left text-[#0EA5E9]">Cliente</TableHead>
                        <TableHead className="text-left text-[#0EA5E9]">Data de Início</TableHead>
                        <TableHead className="text-left text-[#0EA5E9]">Signo</TableHead>
                        <TableHead className="text-left text-[#0EA5E9]">Tratamentos</TableHead>
                        <TableHead className="text-left text-[#0EA5E9]">Análise Antes</TableHead>
                        <TableHead className="text-left text-[#0EA5E9]">Análise Depois</TableHead>
                        <TableHead className="text-center text-[#0EA5E9]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analises.map((analise) => (
                        <TableRow 
                          key={analise.id} 
                          className="hover:bg-blue-50 transition-colors"
                          onClick={() => navigate(`/editar-analise-frequencial/${analise.id}`)}
                          style={{ cursor: 'pointer' }}
                        >
                          <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                            {analise.atencaoFlag && (
                              <span className="inline-flex items-center justify-center">
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{analise.nomeCliente}</TableCell>
                          <TableCell>{formatarData(analise.dataInicio)}</TableCell>
                          <TableCell>{analise.signo || "-"}</TableCell>
                          <TableCell>{contarLembretes(analise.lembretes)}</TableCell>
                          <TableCell>{truncateText(analise.analiseAntes)}</TableCell>
                          <TableCell>{truncateText(analise.analiseDepois)}</TableCell>
                          <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-center gap-2">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-colors hover:scale-110"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditarAnalise(analise.id);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-green-500 hover:bg-green-50 hover:text-green-600 transition-colors hover:scale-110"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarcarFinalizado(analise.id);
                                }}
                                title="Marcar como finalizado"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors hover:scale-110"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setAnaliseParaExcluir(analise.id);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Excluir Análise</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja excluir esta análise de tarot frequencial? Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setAnaliseParaExcluir(null)}>
                                      Cancelar
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={handleExcluirAnalise}
                                      className="bg-red-500 hover:bg-red-600"
                                    >
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-6">
                      <Logo height={80} width={80} />
                    </div>
                    <FileText className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium text-gray-600">Nenhuma análise encontrada</h3>
                    <p className="text-gray-500 mt-2">Clique em "Nova Análise Frequencial" para começar</p>
                    <Button 
                      className="mt-6 bg-[#0EA5E9] hover:bg-[#0284C7] transition-all duration-300"
                      onClick={() => navigate('/analise-frequencial')}
                    >
                      Nova Análise Frequencial
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              {/* Finalizados Tab */}
              <TabsContent value="finalizados" className="animate-fade-in">
                {analisesFinalizadas.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px] text-center text-[#0EA5E9]"></TableHead>
                        <TableHead className="text-left text-[#0EA5E9]">Cliente</TableHead>
                        <TableHead className="text-left text-[#0EA5E9]">Data de Início</TableHead>
                        <TableHead className="text-left text-[#0EA5E9]">Signo</TableHead>
                        <TableHead className="text-left text-[#0EA5E9]">Tratamentos</TableHead>
                        <TableHead className="text-left text-[#0EA5E9]">Análise Antes</TableHead>
                        <TableHead className="text-left text-[#0EA5E9]">Análise Depois</TableHead>
                        <TableHead className="text-center text-[#0EA5E9]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analisesFinalizadas.map((analise) => (
                        <TableRow 
                          key={analise.id} 
                          className="hover:bg-gray-50 transition-colors bg-gray-50/50"
                          onClick={() => navigate(`/editar-analise-frequencial/${analise.id}`)}
                          style={{ cursor: 'pointer' }}
                        >
                          <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                            {analise.atencaoFlag && (
                              <span className="inline-flex items-center justify-center">
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{analise.nomeCliente}</TableCell>
                          <TableCell>{formatarData(analise.dataInicio)}</TableCell>
                          <TableCell>{analise.signo || "-"}</TableCell>
                          <TableCell>{contarLembretes(analise.lembretes)}</TableCell>
                          <TableCell>{truncateText(analise.analiseAntes)}</TableCell>
                          <TableCell>{truncateText(analise.analiseDepois)}</TableCell>
                          <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-center gap-2">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-colors hover:scale-110"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDesfazerFinalizacao(analise.id);
                                }}
                                title="Mover para Em andamento"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors hover:scale-110"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setAnaliseParaExcluir(analise.id);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Excluir Análise</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja excluir esta análise de tarot frequencial? Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setAnaliseParaExcluir(null)}>
                                      Cancelar
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={handleExcluirAnalise}
                                      className="bg-red-500 hover:bg-red-600"
                                    >
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium text-gray-600">Nenhuma análise finalizada</h3>
                    <p className="text-gray-500 mt-2">As análises finalizadas aparecerão aqui</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
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

export default ListagemTarot;
