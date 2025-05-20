
import React, { useState, useEffect, ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { ChevronRight, FileText, Download, Search, ArrowLeft, PieChart, DollarSign } from "lucide-react";
import Logo from "@/components/Logo";
import useUserDataService from "@/services/userDataService";
import { useToast } from "@/hooks/use-toast";

const RelatorioGeral = () => {
  const navigate = useNavigate();
  const { getAtendimentos } = useUserDataService();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [clientes, setClientes] = useState<Array<any>>([]);
  const [filteredClientes, setFilteredClientes] = useState<Array<any>>([]);

  // Carregar todos os dados de atendimentos
  useEffect(() => {
    const atendimentos = getAtendimentos();
    
    // Agrupar atendimentos por cliente (nome)
    const clientesMap = new Map();
    
    atendimentos.forEach((atendimento: any) => {
      if (!clientesMap.has(atendimento.nome)) {
        clientesMap.set(atendimento.nome, {
          nome: atendimento.nome,
          atendimentos: [],
          valorTotal: 0,
          tiposMaisFrequentes: {},
          statusPagamento: {
            pago: 0,
            pendente: 0,
            parcelado: 0
          }
        });
      }
      
      const clienteData = clientesMap.get(atendimento.nome);
      clienteData.atendimentos.push(atendimento);
      
      // Calcular valor total
      clienteData.valorTotal += parseFloat(atendimento.valor || 0);
      
      // Contabilizar tipos de serviço
      const tipoServico = atendimento.tipoServico;
      clienteData.tiposMaisFrequentes[tipoServico] = (clienteData.tiposMaisFrequentes[tipoServico] || 0) + 1;
      
      // Contabilizar status de pagamento
      const statusPagamento = atendimento.statusPagamento || "pendente";
      clienteData.statusPagamento[statusPagamento] += 1;
    });
    
    // Converter Map para Array
    const clientesArray = Array.from(clientesMap.values()).map(cliente => {
      // Encontrar o tipo mais frequente
      let tipoMaisFrequente = "";
      let maxCount = 0;
      
      Object.entries(cliente.tiposMaisFrequentes).forEach(([tipo, count]: [string, number]) => {
        if (count > maxCount) {
          maxCount = count;
          tipoMaisFrequente = tipo;
        }
      });
      
      // Calcular média de custo por atendimento
      const mediaCusto = cliente.valorTotal / cliente.atendimentos.length;
      
      return {
        ...cliente,
        tipoMaisFrequente,
        mediaCusto: isNaN(mediaCusto) ? 0 : mediaCusto,
        totalAtendimentos: cliente.atendimentos.length
      };
    });
    
    // Ordenar por quantidade de atendimentos (decrescente)
    clientesArray.sort((a, b) => b.totalAtendimentos - a.totalAtendimentos);
    
    setClientes(clientesArray);
    setFilteredClientes(clientesArray);
  }, [getAtendimentos]);
  
  // Filtrar clientes quando o termo de busca mudar
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredClientes(clientes);
      return;
    }
    
    const filtered = clientes.filter(cliente => 
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredClientes(filtered);
  }, [searchTerm, clientes]);

  // Função para baixar relatório em CSV
  const downloadRelatorioCsv = (cliente: any) => {
    try {
      // Cabeçalho do CSV
      let csvContent = "Nome do Cliente,Total de Atendimentos,Valor Total,Média por Atendimento,Serviço Mais Frequente,Pagos,Pendentes,Parcelados\n";
      
      // Adicionar dados do cliente
      csvContent += `"${cliente.nome}",`;
      csvContent += `${cliente.totalAtendimentos},`;
      csvContent += `R$ ${cliente.valorTotal.toFixed(2)},`;
      csvContent += `R$ ${cliente.mediaCusto.toFixed(2)},`;
      csvContent += `"${cliente.tipoMaisFrequente.replace('-', ' ')}",`;
      csvContent += `${cliente.statusPagamento.pago},`;
      csvContent += `${cliente.statusPagamento.pendente},`;
      csvContent += `${cliente.statusPagamento.parcelado}\n\n`;
      
      // Adicionar detalhes de cada atendimento
      csvContent += "Data,Serviço,Valor,Status de Pagamento\n";
      
      cliente.atendimentos.forEach((atendimento: any) => {
        const data = atendimento.dataAtendimento ? new Date(atendimento.dataAtendimento).toLocaleDateString('pt-BR') : 'Data não registrada';
        csvContent += `${data},`;
        csvContent += `"${atendimento.tipoServico.replace('-', ' ')}",`;
        csvContent += `R$ ${parseFloat(atendimento.valor || 0).toFixed(2)},`;
        csvContent += `${atendimento.statusPagamento || 'Pendente'}\n`;
      });
      
      // Criar blob e link para download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Relatorio_${cliente.nome.replace(/ /g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download iniciado",
        description: `O relatório de ${cliente.nome} está sendo baixado.`,
      });
    } catch (error) {
      console.error("Erro ao gerar CSV:", error);
      toast({
        variant: "destructive",
        title: "Erro ao baixar relatório",
        description: "Ocorreu um erro ao gerar o arquivo CSV.",
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
              Relatório Geral
            </h1>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-[#0EA5E9] hover:bg-blue-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-700">Relatório por Cliente</h2>
            <p className="text-sm text-gray-500">Visão geral de todos os clientes e seus atendimentos</p>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Buscar cliente..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {filteredClientes.length > 0 ? (
          <div className="grid gap-6">
            {filteredClientes.map((cliente, index) => (
              <Card key={index} className="border-blue-100 shadow-md overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
                  <CardTitle className="flex justify-between">
                    <div className="text-[#0EA5E9] capitalize">{cliente.nome}</div>
                    <div className="text-sm font-normal text-gray-500 flex items-center">
                      <FileText className="h-4 w-4 mr-1" /> {cliente.totalAtendimentos} atendimentos
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <InfoCard 
                      icon={<DollarSign className="h-5 w-5 text-emerald-600" />}
                      title="Valor Total" 
                      value={`R$ ${cliente.valorTotal.toFixed(2)}`} 
                    />
                    <InfoCard 
                      icon={<PieChart className="h-5 w-5 text-blue-600" />}
                      title="Serviço Mais Frequente" 
                      value={cliente.tipoMaisFrequente.replace('-', ' ')} 
                      className="capitalize"
                    />
                    <InfoCard 
                      icon={<DollarSign className="h-5 w-5 text-purple-600" />}
                      title="Média por Atendimento" 
                      value={`R$ ${cliente.mediaCusto.toFixed(2)}`} 
                    />
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="font-medium text-gray-700 mb-2">Status de Pagamentos</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-green-50 p-2 rounded-md text-center">
                        <div className="text-sm text-gray-500">Pagos</div>
                        <div className="font-semibold text-green-600">{cliente.statusPagamento.pago}</div>
                      </div>
                      <div className="bg-yellow-50 p-2 rounded-md text-center">
                        <div className="text-sm text-gray-500">Pendentes</div>
                        <div className="font-semibold text-yellow-600">{cliente.statusPagamento.pendente}</div>
                      </div>
                      <div className="bg-blue-50 p-2 rounded-md text-center">
                        <div className="text-sm text-gray-500">Parcelados</div>
                        <div className="font-semibold text-blue-600">{cliente.statusPagamento.parcelado}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-between">
                    <Button 
                      onClick={() => navigate(`/relatorio-individual/${cliente.atendimentos[0]?.id}`)}
                      className="text-[#0EA5E9] bg-blue-50 hover:bg-blue-100"
                    >
                      Ver Detalhes <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                    <Button 
                      onClick={() => downloadRelatorioCsv(cliente)}
                      className="bg-[#0EA5E9] hover:bg-[#0284C7]"
                    >
                      <Download className="mr-1 h-4 w-4" /> Baixar Relatório
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-blue-100 shadow-md">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <FileText className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-600">Nenhum cliente encontrado</h3>
              <p className="text-gray-500 mt-2">
                {searchTerm ? "Tente buscar com outros termos" : "Adicione atendimentos para gerar relatórios"}
              </p>
              <Button 
                className="mt-6 bg-[#0EA5E9] hover:bg-[#0284C7]"
                onClick={() => navigate('/novo-atendimento')}
              >
                Adicionar Atendimento
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

interface InfoCardProps {
  icon: ReactNode;
  title: string;
  value: string;
  className?: string;
}

const InfoCard = ({ icon, title, value, className = "" }: InfoCardProps) => (
  <div className="bg-blue-50 bg-opacity-50 p-4 rounded-lg">
    <div className="flex items-center gap-3">
      <div className="rounded-full bg-white p-2 shadow-sm">{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className={`font-semibold ${className}`}>{value}</p>
      </div>
    </div>
  </div>
);

export default RelatorioGeral;
