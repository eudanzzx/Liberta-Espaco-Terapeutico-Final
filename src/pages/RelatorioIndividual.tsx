
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
  MessageSquare
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import useUserDataService from "@/services/userDataService";
import Logo from "@/components/Logo";
import UserMenu from "@/components/UserMenu";
import { Separator } from '@/components/ui/separator';

const RelatorioIndividual = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { getAtendimentos } = useUserDataService();
  const [atendimento, setAtendimento] = useState(null);
  
  useEffect(() => {
    const loadedAtendimentos = getAtendimentos();
    const found = loadedAtendimentos.find(item => item.id === id);
    
    if (found) {
      setAtendimento(found);
    }
  }, [id]);
  
  const handleDownloadReport = () => {
    toast({
      title: "Relatório gerado",
      description: "O relatório desta consulta foi baixado com sucesso.",
    });
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-700">Detalhes do Atendimento</h2>
          <Button 
            onClick={handleDownloadReport}
            className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white"
          >
            <Download className="mr-2 h-4 w-4" /> Baixar Relatório desta Consulta
          </Button>
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
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-lg font-medium">Pago</span>
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
            <div className="space-y-8">
              {/* Aqui poderia listar outros atendimentos do mesmo cliente */}
              <div className="flex items-center justify-center py-8">
                <Button 
                  variant="outline" 
                  className="border-[#0EA5E9] text-[#0EA5E9] hover:bg-blue-50"
                  onClick={() => navigate(`/relatorio-geral`)}
                >
                  Ver todos os atendimentos deste cliente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RelatorioIndividual;
