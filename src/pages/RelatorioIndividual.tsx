
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Download, 
  FileText, 
  User, 
  Calendar, 
  DollarSign,
  ArrowLeft,
  Clock,
  Tag,
  MessageSquare,
  Pencil,
  FileDown
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import useUserDataService from "@/services/userDataService";
import Logo from "@/components/Logo";
import UserMenu from "@/components/UserMenu";
import { Separator } from '@/components/ui/separator';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const RelatorioIndividual = () => {
  const navigate = useNavigate();
  const { id } = useParams<{id: string}>();
  const { toast } = useToast();
  const { getAtendimentos } = useUserDataService();
  const [atendimento, setAtendimento] = useState<any>(null);
  const [atendimentosCliente, setAtendimentosCliente] = useState<any[]>([]);
  
  useEffect(() => {
    const loadedAtendimentos = getAtendimentos();
    const found = loadedAtendimentos.find(item => item.id === id);
    
    if (found) {
      setAtendimento(found);
      
      // Encontrar todos os atendimentos do mesmo cliente
      const mesmoCliente = loadedAtendimentos.filter(
        item => item.nome === found.nome && item.id !== found.id
      );
      setAtendimentosCliente(mesmoCliente);
    }
  }, [id, getAtendimentos]);
  
  const handleDownloadReport = () => {
    if (!atendimento) return;
    
    try {
      const doc = new jsPDF();
      
      // Adicionar cabeçalho
      doc.setFontSize(18);
      doc.setTextColor(14, 165, 233); // Cor azul do Libertá (#0EA5E9)
      doc.text('Relatório de Atendimento Individual', 105, 15, { align: 'center' });
      
      // Informações do cliente
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(`Cliente: ${atendimento.nome}`, 14, 30);
      
      if (atendimento.dataNascimento) {
        const dataNasc = new Date(atendimento.dataNascimento).toLocaleDateString('pt-BR');
        doc.text(`Data de Nascimento: ${dataNasc}`, 14, 38);
      }
      
      if (atendimento.signo) {
        doc.text(`Signo: ${atendimento.signo}`, 14, 46);
      }
      
      if (atendimento.email) {
        doc.text(`Email: ${atendimento.email}`, 14, 54);
      }
      
      // Linha separadora
      doc.line(14, 60, 196, 60);
      
      // Detalhes do atendimento
      doc.setFontSize(14);
      doc.setTextColor(14, 165, 233);
      doc.text('Detalhes do Atendimento', 105, 70, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      const formattedDate = atendimento.dataAtendimento 
        ? new Date(atendimento.dataAtendimento).toLocaleDateString('pt-BR')
        : '-';
      
      doc.text(`Data do Atendimento: ${formattedDate}`, 14, 80);
      doc.text(`Tipo de Serviço: ${atendimento.tipoServico.replace('-', ' ')}`, 14, 88);
      doc.text(`Valor Cobrado: R$ ${parseFloat(atendimento.valor || 0).toFixed(2)}`, 14, 96);
      doc.text(`Status de Pagamento: ${atendimento.statusPagamento || 'Pendente'}`, 14, 104);
      
      if (atendimento.atencaoFlag) {
        doc.setTextColor(220, 38, 38); // Vermelho para atenção
        doc.text(`ATENÇÃO ESPECIAL: Este cliente requer atenção especial`, 14, 112);
        doc.setTextColor(0, 0, 0); // Restaurar cor preta
      }
      
      // Observações
      doc.setFontSize(14);
      doc.setTextColor(14, 165, 233);
      doc.text('Observações', 14, 130);
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      const observacoes = atendimento.observacoes || "Nenhuma observação registrada.";
      
      // Quebrar texto de observações em linhas
      const splitObservacoes = doc.splitTextToSize(observacoes, 180);
      doc.text(splitObservacoes, 14, 140);
      
      // Identificação e rodapé
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(`Libertá - Relatório gerado em ${new Date().toLocaleDateString('pt-BR')}`, 
        105, doc.internal.pageSize.height - 10, { align: 'center' });
      
      // Salvar o PDF
      doc.save(`Atendimento_${atendimento.nome.replace(/ /g, '_')}_${formattedDate.replace(/\//g, '-')}.pdf`);
      
      toast({
        title: "Relatório gerado",
        description: "O relatório desta consulta foi baixado com sucesso.",
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
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pago':
        return 'bg-green-500';
      case 'pendente':
        return 'bg-yellow-500';
      case 'parcelado':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  if (!atendimento) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <Card className="max-w-md w-full border-blue-100 shadow-md">
          <CardContent className="py-12 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600">Atendimento não encontrado</h3>
            <p className="text-gray-500 mt-2">O atendimento solicitado não existe ou foi removido</p>
            <Button 
              className="mt-6 bg-[#0EA5E9] hover:bg-[#0284C7]"
              onClick={() => navigate('/relatorio-geral')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Relatórios
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const formattedDate = atendimento.dataAtendimento 
    ? new Date(atendimento.dataAtendimento).toLocaleDateString('pt-BR')
    : '-';
    
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-md py-4 px-6 border-b border-blue-100">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo height={70} width={70} />
            <h1 className="text-2xl font-bold text-[#0EA5E9]">
              Libertá - Relatório Individual
            </h1>
          </div>
          <div className="flex gap-2 items-center">
            <Button 
              variant="outline" 
              className="border-[#0EA5E9] text-[#0EA5E9] hover:bg-blue-50"
              onClick={() => navigate('/relatorio-geral')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar aos Relatórios
            </Button>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-700">Detalhes do Atendimento</h2>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="border-[#0EA5E9] text-[#0EA5E9] hover:bg-blue-50"
              onClick={() => navigate(`/editar-atendimento/${atendimento.id}`)}
            >
              <Pencil className="mr-2 h-4 w-4" /> Editar Atendimento
            </Button>
            <Button 
              onClick={handleDownloadReport}
              className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white"
            >
              <FileDown className="mr-2 h-4 w-4" /> Baixar PDF
            </Button>
          </div>
        </div>
        
        {/* Informações do Cliente */}
        <Card className="mb-8 border-blue-100 shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
            <div className="flex justify-between items-center">
              <CardTitle className="text-[#0EA5E9] flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações do Cliente
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Nome do Cliente</span>
                <span className="text-lg font-medium">{atendimento.nome}</span>
              </div>
              {atendimento.dataNascimento && (
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Data de Nascimento</span>
                  <span className="text-lg font-medium">
                    {new Date(atendimento.dataNascimento).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
              {atendimento.signo && (
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Signo</span>
                  <span className="text-lg font-medium">{atendimento.signo}</span>
                </div>
              )}
              {atendimento.email && (
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Email</span>
                  <span className="text-lg font-medium">{atendimento.email}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Detalhes do Atendimento */}
        <Card className="mb-8 border-blue-100 shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
            <CardTitle className="text-[#0EA5E9] flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Detalhes do Atendimento
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Data do Atendimento</span>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-[#0EA5E9]" />
                  <span className="text-lg font-medium">{formattedDate}</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Tipo de Serviço</span>
                <div className="flex items-center gap-2 mt-1">
                  <Tag className="h-4 w-4 text-[#0EA5E9]" />
                  <span className="text-lg font-medium capitalize">
                    {atendimento.tipoServico.replace('-', ' ')}
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Valor Cobrado</span>
                <div className="flex items-center gap-2 mt-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-lg font-medium text-green-600">
                    R$ {parseFloat(atendimento.valor || 0).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Status de Pagamento</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`h-3 w-3 rounded-full ${getStatusClass(atendimento.statusPagamento || 'pendente')}`}></div>
                  <span className="text-lg font-medium capitalize">{atendimento.statusPagamento || 'Pendente'}</span>
                </div>
              </div>
            </div>
            
            {atendimento.atencaoFlag && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-md">
                <h4 className="font-semibold text-red-600 flex items-center gap-2 mb-2">
                  <span className="h-2 w-2 rounded-full bg-red-600"></span>
                  Atenção Especial
                </h4>
                <p className="text-red-700">
                  Este cliente requer atenção especial
                </p>
              </div>
            )}
            
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#0EA5E9]" />
                Observações
              </h4>
              <div className="p-4 bg-gray-50 rounded-md border border-gray-100">
                <p className="text-gray-700">
                  {atendimento.observacoes || "Nenhuma observação registrada."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Histórico de Atendimentos do Cliente */}
        <Card className="border-blue-100 shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
            <CardTitle className="text-[#0EA5E9]">Histórico de Atendimentos do Cliente</CardTitle>
            <CardDescription>Outros atendimentos realizados para {atendimento.nome}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {atendimentosCliente.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-4 text-[#0EA5E9]">Data</th>
                      <th className="text-left py-2 px-4 text-[#0EA5E9]">Serviço</th>
                      <th className="text-right py-2 px-4 text-[#0EA5E9]">Valor</th>
                      <th className="text-center py-2 px-4 text-[#0EA5E9]">Status</th>
                      <th className="text-center py-2 px-4 text-[#0EA5E9]">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {atendimentosCliente.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-blue-50">
                        <td className="py-3 px-4">
                          {item.dataAtendimento ? new Date(item.dataAtendimento).toLocaleDateString('pt-BR') : '-'}
                        </td>
                        <td className="py-3 px-4 capitalize">{item.tipoServico.replace('-', ' ')}</td>
                        <td className="py-3 px-4 text-right">R$ {parseFloat(item.valor || 0).toFixed(2)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium 
                            ${item.statusPagamento === 'pago' ? 'bg-green-100 text-green-800' : 
                              item.statusPagamento === 'parcelado' ? 'bg-red-100 text-red-800' : 
                              'bg-yellow-100 text-yellow-800'}`}>
                            {(item.statusPagamento || 'pendente').charAt(0).toUpperCase() + 
                             (item.statusPagamento || 'pendente').slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-[#0EA5E9] hover:bg-blue-100 hover:text-[#0284C7]"
                              onClick={() => navigate(`/relatorio-individual/${item.id}`)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-[#0EA5E9] hover:bg-blue-100 hover:text-[#0284C7]"
                              onClick={() => navigate(`/editar-atendimento/${item.id}`)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Não há outros atendimentos para este cliente.</p>
                <Button 
                  variant="outline" 
                  className="mt-4 border-[#0EA5E9] text-[#0EA5E9] hover:bg-blue-50"
                  onClick={() => navigate('/novo-atendimento')}
                >
                  Registrar Novo Atendimento
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RelatorioIndividual;
