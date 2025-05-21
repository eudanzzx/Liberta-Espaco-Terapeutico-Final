
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Users, Activity, FileText, Pencil, Trash2, BarChart3, FileDown } from "lucide-react";
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
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Add the type declaration for jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    getNumberOfPages: () => number;
  }
}

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

  const downloadClientReport = (atendimento) => {
    try {
      const doc = new jsPDF();
      
      // Add header
      doc.setFontSize(18);
      doc.setTextColor(14, 165, 233); // Cor azul do Libertá
      doc.text(`Relatório de Atendimento: ${atendimento.nome}`, 105, 15, { align: 'center' });
      
      // Client info
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      
      let yPos = 30;
      
      if (atendimento.dataNascimento) {
        doc.text(`Data de Nascimento: ${new Date(atendimento.dataNascimento).toLocaleDateString('pt-BR')}`, 14, yPos);
        yPos += 8;
      }
      
      if (atendimento.signo) {
        doc.text(`Signo: ${atendimento.signo}`, 14, yPos);
        yPos += 8;
      }
      
      doc.text(`Tipo de Serviço: ${atendimento.tipoServico?.replace('-', ' ') || 'Não especificado'}`, 14, yPos);
      yPos += 8;
      
      doc.text(`Data do Atendimento: ${atendimento.dataAtendimento ? new Date(atendimento.dataAtendimento).toLocaleDateString('pt-BR') : 'Não especificado'}`, 14, yPos);
      yPos += 8;
      
      doc.text(`Valor: R$ ${parseFloat(atendimento.valor || "0").toFixed(2)}`, 14, yPos);
      yPos += 8;
      
      doc.text(`Status de Pagamento: ${atendimento.statusPagamento || 'Não especificado'}`, 14, yPos);
      yPos += 15;
      
      // Detalhes do atendimento
      doc.setFontSize(14);
      doc.setTextColor(14, 165, 233);
      doc.text('Detalhes do Atendimento', 14, yPos);
      yPos += 10;
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      if (atendimento.destino) {
        const destinoLines = doc.splitTextToSize(`Destino: ${atendimento.destino}`, 180);
        doc.text(destinoLines, 14, yPos);
        yPos += destinoLines.length * 5 + 5;
      }
      
      if (atendimento.ano) {
        const anoLines = doc.splitTextToSize(`Ano: ${atendimento.ano}`, 180);
        doc.text(anoLines, 14, yPos);
        yPos += anoLines.length * 5 + 5;
      }
      
      if (atendimento.detalhes) {
        const detalhesLines = doc.splitTextToSize(`Detalhes da Sessão: ${atendimento.detalhes}`, 180);
        doc.text(detalhesLines, 14, yPos);
        yPos += detalhesLines.length * 5 + 5;
      }
      
      if (atendimento.tratamento) {
        const tratamentoLines = doc.splitTextToSize(`Tratamento: ${atendimento.tratamento}`, 180);
        doc.text(tratamentoLines, 14, yPos);
        yPos += tratamentoLines.length * 5 + 5;
      }
      
      if (atendimento.indicacao) {
        const indicacaoLines = doc.splitTextToSize(`Indicação: ${atendimento.indicacao}`, 180);
        doc.text(indicacaoLines, 14, yPos);
        yPos += indicacaoLines.length * 5 + 5;
      }
      
      if (atendimento.atencaoFlag) {
        doc.setTextColor(220, 38, 38);
        doc.text(`ATENÇÃO: ${atendimento.atencaoNota || 'Este cliente requer atenção especial'}`, 14, yPos);
        doc.setTextColor(0, 0, 0);
        yPos += 8;
      }
      
      // Footer
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(
        `Libertá - Relatório gerado em ${new Date().toLocaleDateString('pt-BR')}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
      
      // Save PDF
      doc.save(`Relatório_${atendimento.nome.replace(/ /g, '_')}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
      
      toast.success("Relatório gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar relatório");
    }
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

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "pago":
        return "bg-green-500 text-white";
      case "pendente":
        return "bg-yellow-500 text-white";
      case "parcelado":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-200 text-gray-800";
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
              variant="outline" 
              className="border-[#0EA5E9] text-[#0EA5E9] hover:bg-blue-50"
              onClick={() => navigate('/relatorio-geral')}
            >
              <BarChart3 className="mr-1 h-4 w-4" />
              Relatórios
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
            onClick={() => {}} 
          />
          <DashboardCard 
            title="Esta Semana" 
            value={atendimentosSemana.toString()}
            icon={<CalendarDays className="h-8 w-8 text-[#0EA5E9]" />} 
            onClick={() => {}}
          />
          <DashboardCard 
            title={`Recebido (${getPeriodoLabel()})`}
            value={`R$ ${totalRecebido.toFixed(2)}`} 
            icon={<Activity className="h-8 w-8 text-[#0EA5E9]" />} 
            onClick={() => navigate('/relatorios-financeiros')}
          />
          <DashboardCard 
            title="Relatórios"
            value="Ver" 
            icon={<BarChart3 className="h-8 w-8 text-[#0EA5E9]" />}
            onClick={() => navigate('/relatorio-geral')}
            className="cursor-pointer hover:bg-blue-50 transition-colors"
          />
        </div>

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Atendimentos Recentes</h3>
          <Button 
            className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white"
            onClick={() => {
              if (atendimentos.length === 0) {
                toast.error("Não há atendimentos para gerar relatório");
                return;
              }
              
              try {
                const doc = new jsPDF();
                
                // Cabeçalho
                doc.setFontSize(18);
                doc.setTextColor(14, 165, 233);
                doc.text('Relatório de Atendimentos', 105, 15, { align: 'center' });
                
                // Resumo
                doc.setFontSize(14);
                doc.setTextColor(0, 0, 0);
                doc.text(`Total de Atendimentos: ${atendimentos.length}`, 14, 30);
                doc.text(`Valor Total: R$ ${totalRecebido.toFixed(2)} (${getPeriodoLabel()})`, 14, 38);
                doc.text(`Atendimentos Esta Semana: ${atendimentosSemana}`, 14, 46);
                
                // Posição inicial para a tabela
                let startY = 60;
                
                // Configuração da tabela
                const tableColumn = ["Nome", "Data", "Serviço", "Valor", "Status"];
                const tableRows = atendimentos.map(a => [
                  a.nome,
                  a.dataAtendimento ? new Date(a.dataAtendimento).toLocaleDateString('pt-BR') : '-',
                  a.tipoServico ? a.tipoServico.replace('-', ' ') : '-',
                  `R$ ${parseFloat(a.valor || "0").toFixed(2)}`,
                  a.statusPagamento || 'Pendente'
                ]);
                
                // Adicionar a tabela ao documento
                doc.autoTable({
                  head: [tableColumn],
                  body: tableRows,
                  startY: startY,
                  styles: { fontSize: 10, cellPadding: 3 },
                  headerStyles: { fillColor: [14, 165, 233], textColor: [255, 255, 255] }
                });
                
                // Rodapé
                doc.setFontSize(10);
                doc.setTextColor(150);
                doc.text(
                  `Libertá - Relatório gerado em ${new Date().toLocaleDateString('pt-BR')}`,
                  105,
                  doc.internal.pageSize.height - 10,
                  { align: 'center' }
                );
                
                // Salvar o PDF
                doc.save(`Relatorio_Atendimentos_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
                
                toast.success("Relatório gerado com sucesso!");
              } catch (error) {
                console.error("Erro ao gerar PDF:", error);
                toast.error("Erro ao gerar relatório");
              }
            }}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Baixar Relatório
          </Button>
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
                      <th className="text-center py-3 px-4 text-[#0EA5E9]">Status</th>
                      <th className="text-center py-3 px-4 text-[#0EA5E9]">Atenção</th>
                      <th className="text-center py-3 px-4 text-[#0EA5E9]">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {atendimentos.map((atendimento) => (
                      <tr key={atendimento.id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                        <td className="py-3 px-4">
                          <span 
                            className="cursor-pointer hover:text-[#0EA5E9]"
                            onClick={() => navigate(`/relatorio-individual/${atendimento.id}`)}
                          >
                            {atendimento.nome}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {atendimento.dataAtendimento ? new Date(atendimento.dataAtendimento).toLocaleDateString('pt-BR') : ''}
                        </td>
                        <td className="py-3 px-4 capitalize">{atendimento.tipoServico.replace('-', ' ')}</td>
                        <td className="py-3 px-4 text-right">R$ {parseFloat(atendimento.valor || 0).toFixed(2)}</td>
                        <td className="py-3 px-4 text-center">
                          {atendimento.statusPagamento && (
                            <div className={`inline-flex items-center ${getStatusColor(atendimento.statusPagamento)} text-xs font-medium px-2.5 py-1 rounded-full`}>
                              {atendimento.statusPagamento.toUpperCase()}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {atendimento.atencaoFlag ? (
                            <div className="inline-flex items-center bg-red-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">
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
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                            onClick={() => downloadClientReport(atendimento)}
                          >
                            <FileText className="h-4 w-4" />
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

const DashboardCard = ({ title, value, icon, onClick, className = "" }) => (
  <Card 
    className={`border-blue-100 shadow-md hover:shadow-lg transition-all duration-300 ${className}`}
    onClick={onClick}
  >
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

const Users = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export default Index;
