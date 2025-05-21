
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Download, 
  FileText, 
  User, 
  Calendar, 
  DollarSign,
  ArrowLeft,
  Clock,
  Tag,
  CheckCircle,
  FileDown,
  Pencil
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import UserMenu from "@/components/UserMenu";
import { format } from 'date-fns';
import useUserDataService from "@/services/userDataService";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Add the type declaration for jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    getNumberOfPages: () => number;
  }
}

const RelatorioGeral = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [atendimentos, setAtendimentos] = useState([]);
  const [clientesUnicos, setClientesUnicos] = useState([]);
  const { getAtendimentos } = useUserDataService();
  const { toast } = useToast();

  useEffect(() => {
    loadAtendimentos();
  }, []);

  const loadAtendimentos = async () => {
    const data = getAtendimentos();
    setAtendimentos(data);
  };

  useEffect(() => {
    const nomes = [...new Set(atendimentos.map(item => item.nome))];
    setClientesUnicos(nomes);
  }, [atendimentos]);

  const filteredClientes = clientesUnicos.filter(cliente =>
    cliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const downloadClienteReport = (cliente) => {
    try {
      const doc = new jsPDF();
      const atendimentosCliente = atendimentos.filter(a => a.nome === cliente);
      
      // Add header
      doc.setFontSize(18);
      doc.setTextColor(14, 165, 233); // Cor azul do Libertá
      doc.text(`Relatório Consolidado: ${cliente}`, 105, 15, { align: 'center' });
      
      // Client info
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      
      let yPos = 30;
      
      const firstAtendimento = atendimentosCliente[0];
      if (firstAtendimento.dataNascimento) {
        doc.text(`Data de Nascimento: ${new Date(firstAtendimento.dataNascimento).toLocaleDateString('pt-BR')}`, 14, yPos);
        yPos += 8;
      }
      
      if (firstAtendimento.signo) {
        doc.text(`Signo: ${firstAtendimento.signo}`, 14, yPos);
        yPos += 8;
      }
      
      doc.text(`Total de Atendimentos: ${atendimentosCliente.length}`, 14, yPos);
      yPos += 8;
      
      const valorTotal = atendimentosCliente.reduce((acc, curr) => acc + parseFloat(curr.valor || "0"), 0);
      doc.text(`Valor Total: R$ ${valorTotal.toFixed(2)}`, 14, yPos);
      yPos += 15;
      
      // Table of appointments
      const tableColumn = ["Data", "Tipo", "Valor", "Status", "Observações"];
      const tableRows = atendimentosCliente.map(a => [
        a.dataAtendimento ? new Date(a.dataAtendimento).toLocaleDateString('pt-BR') : '-',
        a.tipoServico ? a.tipoServico.replace('-', ' ') : '-',
        `R$ ${parseFloat(a.valor || "0").toFixed(2)}`,
        a.statusPagamento || 'Pendente',
        a.detalhes ? (a.detalhes.length > 30 ? a.detalhes.substring(0, 30) + '...' : a.detalhes) : '-'
      ]);
      
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: yPos,
        styles: { fontSize: 10, cellPadding: 3 },
        headerStyles: { fillColor: [14, 165, 233], textColor: [255, 255, 255] }
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 15;
      
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      // Additional details section
      doc.setFontSize(14);
      doc.setTextColor(14, 165, 233);
      doc.text('Detalhes dos Atendimentos', 14, yPos);
      yPos += 10;
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      atendimentosCliente.forEach((a, index) => {
        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(12);
        // Use font-weight instead of setFontStyle
        doc.setFont(undefined, 'bold');
        doc.text(`Atendimento ${index + 1}: ${a.dataAtendimento ? new Date(a.dataAtendimento).toLocaleDateString('pt-BR') : '-'}`, 14, yPos);
        yPos += 8;
        
        // Reset to normal font
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        
        if (a.detalhes) {
          const detalhesLines = doc.splitTextToSize(`Detalhes: ${a.detalhes}`, 180);
          doc.text(detalhesLines, 14, yPos);
          yPos += detalhesLines.length * 5 + 5;
        }
        
        if (a.tratamento) {
          const tratamentoLines = doc.splitTextToSize(`Tratamento: ${a.tratamento}`, 180);
          doc.text(tratamentoLines, 14, yPos);
          yPos += tratamentoLines.length * 5 + 5;
        }
        
        if (a.indicacao) {
          const indicacaoLines = doc.splitTextToSize(`Indicação: ${a.indicacao}`, 180);
          doc.text(indicacaoLines, 14, yPos);
          yPos += indicacaoLines.length * 5 + 5;
        }
        
        if (a.atencaoFlag) {
          doc.setTextColor(220, 38, 38);
          doc.text(`ATENÇÃO: ${a.atencaoNota || 'Este cliente requer atenção especial'}`, 14, yPos);
          doc.setTextColor(0, 0, 0);
          yPos += 8;
        }
        
        yPos += 5;
      });
      
      // Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(
          `Libertá - Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} - Página ${i} de ${totalPages}`,
          105,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }
      
      // Save PDF
      doc.save(`Relatorio_${cliente.replace(/ /g, '_')}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
      
      toast({
        title: "Relatório gerado",
        description: "O relatório consolidado foi baixado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        variant: "destructive",
        title: "Erro ao baixar relatório",
        description: "Ocorreu um erro ao gerar o arquivo PDF.",
      });
    }
  };

  const getTotalValue = () => {
    return atendimentos.reduce((acc, curr) => acc + parseFloat(curr.valor || "0"), 0).toFixed(2);
  };

  const getStatusCounts = () => {
    const pago = atendimentos.filter(a => a.statusPagamento === 'pago').length;
    const pendente = atendimentos.filter(a => a.statusPagamento === 'pendente').length;
    const parcelado = atendimentos.filter(a => a.statusPagamento === 'parcelado').length;
    return { pago, pendente, parcelado };
  };

  const { pago, pendente, parcelado } = getStatusCounts();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-md py-4 px-6 border-b border-blue-100">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo height={70} width={70} />
            <h1 className="text-2xl font-bold text-[#0EA5E9]">
              Libertá - Relatórios Gerais
            </h1>
          </div>
          <div className="flex gap-2 items-center">
            <Button 
              variant="outline" 
              className="border-[#0EA5E9] text-[#0EA5E9] hover:bg-blue-50"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Início
            </Button>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-blue-200 bg-gradient-to-br from-white to-blue-50 shadow-md hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Atendimentos</p>
                  <p className="text-2xl font-bold">{atendimentos.length}</p>
                </div>
                <div className="rounded-full p-3 bg-blue-100">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-green-200 bg-gradient-to-br from-white to-green-50 shadow-md hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Recebido</p>
                  <p className="text-2xl font-bold">R$ {getTotalValue()}</p>
                </div>
                <div className="rounded-full p-3 bg-green-100">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-purple-200 bg-gradient-to-br from-white to-purple-50 shadow-md hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">Clientes</p>
                  <p className="text-2xl font-bold">{clientesUnicos.length}</p>
                </div>
                <div className="rounded-full p-3 bg-purple-100">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-700">Lista de Clientes</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Buscar cliente..." 
                className="pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            </div>
            <Button 
              className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white"
              onClick={() => {
                const doc = new jsPDF();
                
                // Cabeçalho
                doc.setFontSize(18);
                doc.setTextColor(14, 165, 233);
                doc.text('Relatório Geral Consolidado', 105, 15, { align: 'center' });
                
                // Resumo financeiro
                doc.setFontSize(14);
                doc.setTextColor(0, 0, 0);
                doc.text(`Total de Clientes: ${clientesUnicos.length}`, 14, 30);
                doc.text(`Total de Atendimentos: ${atendimentos.length}`, 14, 38);
                doc.text(`Valor Total: R$ ${getTotalValue()}`, 14, 46);
                
                // Contagem de status
                doc.text(`Pagos: ${pago}`, 14, 54);
                doc.text(`Pendentes: ${pendente}`, 14, 62);
                doc.text(`Parcelados: ${parcelado}`, 14, 70);
                
                // Posição inicial para a tabela
                let startY = 80;
                
                // Configuração da tabela
                const tableColumn = ["Cliente", "Atendimentos", "Valor Total", "Status"];
                const tableRows = clientesUnicos.map(cliente => {
                  const atendimentosCliente = atendimentos.filter(a => a.nome === cliente);
                  const valorTotalCliente = atendimentosCliente.reduce((acc, curr) => acc + parseFloat(curr.valor || "0"), 0).toFixed(2);
                  
                  // Determine predominant status
                  const pagos = atendimentosCliente.filter(a => a.statusPagamento === 'pago').length;
                  const pendentes = atendimentosCliente.filter(a => a.statusPagamento === 'pendente').length;
                  const parcelados = atendimentosCliente.filter(a => a.statusPagamento === 'parcelado').length;
                  
                  let status = "Misto";
                  if (pagos > pendentes && pagos > parcelados) status = "Pago";
                  else if (pendentes > pagos && pendentes > parcelados) status = "Pendente";
                  else if (parcelados > pagos && parcelados > pendentes) status = "Parcelado";
                  
                  return [cliente, atendimentosCliente.length.toString(), `R$ ${valorTotalCliente}`, status];
                });
                
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
                doc.save(`Relatorio_Geral_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
                
                toast({
                  title: "Relatório gerado",
                  description: "O relatório geral foi baixado com sucesso.",
                });
              }}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Baixar Relatório Geral
            </Button>
          </div>
        </div>

        <Card className="border-blue-100 shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
            <CardTitle className="text-[#0EA5E9]">Lista de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-4 text-[#0EA5E9]">Cliente</th>
                    <th className="text-left py-2 px-4 text-[#0EA5E9]">Atendimentos</th>
                    <th className="text-left py-2 px-4 text-[#0EA5E9]">Total</th>
                    <th className="text-left py-2 px-4 text-[#0EA5E9]">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClientes.map(cliente => {
                    const atendimentosCliente = atendimentos.filter(a => a.nome === cliente);
                    const valorTotal = atendimentosCliente.reduce((acc, curr) => acc + parseFloat(curr.valor || "0"), 0).toFixed(2);
                    
                    return (
                      <tr key={cliente} className="hover:bg-blue-50">
                        <td className="py-3 px-4">{cliente}</td>
                        <td className="py-3 px-4">{atendimentosCliente.length}</td>
                        <td className="py-3 px-4">R$ {valorTotal}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-[#0EA5E9] text-[#0EA5E9] hover:bg-blue-50"
                              onClick={() => downloadClienteReport(cliente)}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Relatório
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-[#0EA5E9] text-[#0EA5E9] hover:bg-blue-50"
                              onClick={() => navigate(`/relatorio-individual/${atendimentosCliente[0]?.id}`)}
                            >
                              <User className="h-4 w-4 mr-2" />
                              Detalhes
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

// Solution for the Users icon missing
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

export default RelatorioGeral;
