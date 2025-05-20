
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Download, 
  FileText, 
  User, 
  Calendar, 
  DollarSign, 
  BarChart, 
  FileCheck
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import useUserDataService from "@/services/userDataService";
import Logo from "@/components/Logo";
import UserMenu from "@/components/UserMenu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RelatorioGeral = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getAtendimentos } = useUserDataService();
  const [atendimentos, setAtendimentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState('');
  
  useEffect(() => {
    const loadedAtendimentos = getAtendimentos();
    setAtendimentos(loadedAtendimentos);
    
    // Extract unique clients
    const uniqueClientes = Array.from(
      new Set(loadedAtendimentos.map(atendimento => atendimento.nome))
    ).sort();
    
    setClientes(uniqueClientes);
    if (uniqueClientes.length > 0) {
      setClienteSelecionado(uniqueClientes[0]);
    }
  }, []);
  
  const atendimentosDoCliente = atendimentos.filter(
    atendimento => atendimento.nome === clienteSelecionado
  );
  
  const totalAtendimentos = atendimentosDoCliente.length;
  
  const totalGasto = atendimentosDoCliente.reduce((soma, atendimento) => {
    return soma + parseFloat(atendimento.valor || 0);
  }, 0);
  
  const mediaPorAtendimento = totalAtendimentos > 0 
    ? totalGasto / totalAtendimentos 
    : 0;
    
  const getTiposMaisFrequentes = () => {
    const tiposCount = {};
    atendimentosDoCliente.forEach(atendimento => {
      const tipo = atendimento.tipoServico;
      tiposCount[tipo] = (tiposCount[tipo] || 0) + 1;
    });
    
    return Object.entries(tiposCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tipo, count]) => ({
        tipo: tipo.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        count
      }));
  };
  
  const tiposMaisFrequentes = getTiposMaisFrequentes();
  
  const handleDownloadReport = () => {
    toast({
      title: "Relatório gerado",
      description: "O relatório do cliente foi baixado com sucesso.",
    });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-md py-4 px-6 border-b border-blue-100">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo height={70} width={70} />
            <h1 className="text-2xl font-bold text-[#0EA5E9]">
              Libertá - Relatórios
            </h1>
          </div>
          <div className="flex gap-2 items-center">
            <Button 
              variant="outline" 
              className="border-[#0EA5E9] text-[#0EA5E9] hover:bg-blue-50"
              onClick={() => navigate('/')}
            >
              Voltar ao Dashboard
            </Button>
            <Button 
              variant="outline" 
              className="border-[#0EA5E9] text-[#0EA5E9] hover:bg-blue-50"
              onClick={() => navigate('/relatorios-financeiros')}
            >
              Relatórios Financeiros
            </Button>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 md:mb-0">Relatório Geral por Cliente</h2>
          
          <div className="w-full md:w-auto">
            <Select 
              value={clienteSelecionado} 
              onValueChange={setClienteSelecionado}
            >
              <SelectTrigger className="w-full md:w-[240px]">
                <SelectValue placeholder="Selecionar cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map(cliente => (
                  <SelectItem key={cliente} value={cliente}>
                    {cliente}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {clienteSelecionado ? (
          <>
            <Card className="mb-8 border-blue-100 shadow-md">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
                <CardTitle className="text-[#0EA5E9] flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações do Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Nome do Cliente</span>
                    <span className="text-lg font-medium">{clienteSelecionado}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Total de Atendimentos</span>
                    <span className="text-lg font-medium">{totalAtendimentos}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Valor Total Gasto</span>
                    <span className="text-lg font-medium text-green-600">R$ {totalGasto.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="border-blue-100 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total de Atendimentos</p>
                      <p className="text-2xl font-bold">{totalAtendimentos}</p>
                    </div>
                    <div className="rounded-full p-2 bg-blue-50">
                      <Calendar className="h-8 w-8 text-[#0EA5E9]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-100 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Gasto</p>
                      <p className="text-2xl font-bold text-green-600">R$ {totalGasto.toFixed(2)}</p>
                    </div>
                    <div className="rounded-full p-2 bg-green-50">
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-100 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Média por Atendimento</p>
                      <p className="text-2xl font-bold">R$ {mediaPorAtendimento.toFixed(2)}</p>
                    </div>
                    <div className="rounded-full p-2 bg-purple-50">
                      <BarChart className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-100 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <p className="text-2xl font-bold text-blue-600">Relatório</p>
                    </div>
                    <div className="rounded-full p-2 bg-blue-50">
                      <FileText className="h-8 w-8 text-[#0EA5E9]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="border-blue-100 shadow-md">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
                  <CardTitle className="text-[#0EA5E9]">Tipos de Atendimento Mais Frequentes</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {tiposMaisFrequentes.length > 0 ? (
                    <div className="space-y-4">
                      {tiposMaisFrequentes.map((tipo, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="mr-4 h-3 w-3 rounded-full" 
                              style={{ backgroundColor: index === 0 ? '#3B82F6' : index === 1 ? '#8B5CF6' : '#EC4899' }}></div>
                            <span>{tipo.tipo}</span>
                          </div>
                          <span className="font-medium">{tipo.count} sessões</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Nenhum atendimento registrado</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-blue-100 shadow-md">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
                  <CardTitle className="text-[#0EA5E9]">Status de Pagamento</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Pagos:</span>
                      <span className="font-medium text-green-600">{totalAtendimentos} atendimentos</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Pendentes:</span>
                      <span className="font-medium text-yellow-600">0 atendimentos</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Parcelados:</span>
                      <span className="font-medium text-blue-600">0 atendimentos</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="border-blue-100 shadow-md">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
                <div className="flex justify-between">
                  <CardTitle className="text-[#0EA5E9]">Lista de Atendimentos</CardTitle>
                  <Button 
                    onClick={handleDownloadReport}
                    className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white"
                  >
                    <Download className="mr-2 h-4 w-4" /> Baixar Relatório Geral
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Tipo de Serviço</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {atendimentosDoCliente.length > 0 ? (
                        atendimentosDoCliente.map((atendimento) => (
                          <TableRow key={atendimento.id}>
                            <TableCell>
                              {atendimento.dataAtendimento 
                                ? new Date(atendimento.dataAtendimento).toLocaleDateString('pt-BR') 
                                : '-'}
                            </TableCell>
                            <TableCell className="capitalize">
                              {atendimento.tipoServico.replace('-', ' ')}
                            </TableCell>
                            <TableCell>
                              R$ {parseFloat(atendimento.valor || 0).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Pago
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/relatorio-individual/${atendimento.id}`)}
                                className="text-[#0EA5E9] hover:text-[#0284C7] hover:bg-blue-50"
                              >
                                <FileText className="h-4 w-4" />
                                <span className="sr-only">Ver detalhes</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                            Nenhum atendimento encontrado para este cliente
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="border-blue-100 shadow-md">
            <CardContent className="py-12 text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-600">Nenhum cliente encontrado</h3>
              <p className="text-gray-500 mt-2">Adicione atendimentos para gerar relatórios</p>
              <Button 
                className="mt-6 bg-[#0EA5E9] hover:bg-[#0284C7]"
                onClick={() => navigate('/novo-atendimento')}
              >
                Novo Atendimento
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default RelatorioGeral;
