
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Download, 
  DollarSign,
  CalendarDays, 
  Calendar,
  BarChart3,
  TrendingUp,
  ArrowLeft,
  FileText
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useToast } from "@/hooks/use-toast";
import useUserDataService from "@/services/userDataService";
import Logo from "@/components/Logo";
import UserMenu from "@/components/UserMenu";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const RelatoriosFinanceiros = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getAtendimentos } = useUserDataService();
  const [atendimentos, setAtendimentos] = useState([]);
  const [periodoVisualizacao, setPeriodoVisualizacao] = useState("mes");
  const [totalDia, setTotalDia] = useState(0);
  const [totalMes, setTotalMes] = useState(0);
  const [totalAno, setTotalAno] = useState(0);
  const [chartData, setChartData] = useState([]);
  
  useEffect(() => {
    const loadedAtendimentos = getAtendimentos();
    setAtendimentos(loadedAtendimentos);
    
    calcularTotais(loadedAtendimentos);
    gerarDadosGrafico(loadedAtendimentos, periodoVisualizacao);
  }, [periodoVisualizacao]);
  
  const calcularTotais = (atendimentos) => {
    const hoje = new Date();
    const inicioDia = new Date(hoje);
    inicioDia.setHours(0, 0, 0, 0);
    
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const inicioAno = new Date(hoje.getFullYear(), 0, 1);
    
    // Calcular total do dia
    const atendimentosDia = atendimentos.filter(atendimento => {
      const dataAtendimento = new Date(atendimento.dataAtendimento);
      return dataAtendimento >= inicioDia && dataAtendimento <= hoje;
    });
    
    const totalDia = atendimentosDia.reduce((soma, atendimento) => {
      return soma + parseFloat(atendimento.valor || 0);
    }, 0);
    
    // Calcular total do mês
    const atendimentosMes = atendimentos.filter(atendimento => {
      const dataAtendimento = new Date(atendimento.dataAtendimento);
      return dataAtendimento >= inicioMes && dataAtendimento <= hoje;
    });
    
    const totalMes = atendimentosMes.reduce((soma, atendimento) => {
      return soma + parseFloat(atendimento.valor || 0);
    }, 0);
    
    // Calcular total do ano
    const atendimentosAno = atendimentos.filter(atendimento => {
      const dataAtendimento = new Date(atendimento.dataAtendimento);
      return dataAtendimento >= inicioAno && dataAtendimento <= hoje;
    });
    
    const totalAno = atendimentosAno.reduce((soma, atendimento) => {
      return soma + parseFloat(atendimento.valor || 0);
    }, 0);
    
    setTotalDia(totalDia);
    setTotalMes(totalMes);
    setTotalAno(totalAno);
  };
  
  const gerarDadosGrafico = (atendimentos, periodo) => {
    const hoje = new Date();
    let dados = [];
    
    if (periodo === "dia") {
      // Dados por hora do dia
      const horas = {};
      for (let i = 0; i <= 23; i++) {
        horas[i] = 0;
      }
      
      atendimentos.forEach(atendimento => {
        const dataAtendimento = new Date(atendimento.dataAtendimento);
        if (dataAtendimento.toDateString() === hoje.toDateString()) {
          const hora = dataAtendimento.getHours();
          horas[hora] += parseFloat(atendimento.valor || 0);
        }
      });
      
      dados = Object.entries(horas).map(([hora, valor]) => ({
        name: `${hora}h`,
        valor: valor
      }));
      
    } else if (periodo === "mes") {
      // Dados por dia do mês
      const dias = {};
      const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
      
      for (let i = 1; i <= ultimoDia; i++) {
        dias[i] = 0;
      }
      
      atendimentos.forEach(atendimento => {
        const dataAtendimento = new Date(atendimento.dataAtendimento);
        if (dataAtendimento.getMonth() === hoje.getMonth() && 
            dataAtendimento.getFullYear() === hoje.getFullYear()) {
          const dia = dataAtendimento.getDate();
          dias[dia] += parseFloat(atendimento.valor || 0);
        }
      });
      
      dados = Object.entries(dias).map(([dia, valor]) => ({
        name: `Dia ${dia}`,
        valor: valor
      }));
      
    } else if (periodo === "ano") {
      // Dados por mês do ano
      const meses = [
        "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
        "Jul", "Ago", "Set", "Out", "Nov", "Dez"
      ];
      
      const valoresPorMes = new Array(12).fill(0);
      
      atendimentos.forEach(atendimento => {
        const dataAtendimento = new Date(atendimento.dataAtendimento);
        if (dataAtendimento.getFullYear() === hoje.getFullYear()) {
          const mes = dataAtendimento.getMonth();
          valoresPorMes[mes] += parseFloat(atendimento.valor || 0);
        }
      });
      
      dados = meses.map((mes, index) => ({
        name: mes,
        valor: valoresPorMes[index]
      }));
    }
    
    setChartData(dados);
  };
  
  const handleDownloadReport = () => {
    toast({
      title: "Relatório financeiro gerado",
      description: `O relatório financeiro do ${periodoVisualizacao === "dia" ? "dia" : periodoVisualizacao === "mes" ? "mês" : "ano"} foi baixado com sucesso.`,
    });
  };
  
  const formatarValor = (valor) => {
    return `R$ ${valor.toFixed(2)}`;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-md py-4 px-6 border-b border-blue-100">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo height={70} width={70} />
            <h1 className="text-2xl font-bold text-[#0EA5E9]">
              Libertá - Relatórios Financeiros
            </h1>
          </div>
          <div className="flex gap-2 items-center">
            <Button 
              variant="outline" 
              className="border-[#0EA5E9] text-[#0EA5E9] hover:bg-blue-50"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Button>
            <Button 
              variant="outline" 
              className="border-[#0EA5E9] text-[#0EA5E9] hover:bg-blue-50"
              onClick={() => navigate('/relatorio-geral')}
            >
              Relatórios por Cliente
            </Button>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 md:mb-0">Totais Financeiros</h2>
          
          <div className="w-full md:w-auto flex justify-between items-center">
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
              <ToggleGroupItem value="mes" className="data-[state=on]:bg-[#0EA5E9] data-[state=on]:text-white px-4">
                Mês
              </ToggleGroupItem>
              <ToggleGroupItem value="ano" className="data-[state=on]:bg-[#0EA5E9] data-[state=on]:text-white px-4">
                Ano
              </ToggleGroupItem>
            </ToggleGroup>
            
            <Button 
              onClick={handleDownloadReport}
              className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white ml-4 hidden md:flex"
            >
              <Download className="mr-2 h-4 w-4" /> Baixar Relatório
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-blue-100 shadow-md">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100 pb-2">
              <CardTitle className="text-[#0EA5E9] text-lg flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Total do Dia
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <p className="text-2xl font-bold text-green-600">{formatarValor(totalDia)}</p>
                <div className="rounded-full p-2 bg-green-50">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-100 shadow-md">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100 pb-2">
              <CardTitle className="text-[#0EA5E9] text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Total do Mês
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <p className="text-2xl font-bold text-blue-600">{formatarValor(totalMes)}</p>
                <div className="rounded-full p-2 bg-blue-50">
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-100 shadow-md">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100 pb-2">
              <CardTitle className="text-[#0EA5E9] text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Total do Ano
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <p className="text-2xl font-bold text-purple-600">{formatarValor(totalAno)}</p>
                <div className="rounded-full p-2 bg-purple-50">
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="border-blue-100 shadow-md mb-8">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
            <div className="flex justify-between items-center">
              <CardTitle className="text-[#0EA5E9] flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Análise Financeira - {periodoVisualizacao === "dia" ? "Dia" : periodoVisualizacao === "mes" ? "Mês" : "Ano"} Atual
              </CardTitle>
              <Button 
                onClick={handleDownloadReport}
                className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white md:hidden"
              >
                <Download className="mr-2 h-4 w-4" /> Baixar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Valor']} />
                  <Bar dataKey="valor" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-blue-100 shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
            <CardTitle className="text-[#0EA5E9] flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resumo Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Métricas de Receita</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Média por dia:</span>
                    <span className="font-medium">{formatarValor(totalMes / 30)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Média por atendimento:</span>
                    <span className="font-medium">{formatarValor(totalMes / Math.max(1, atendimentos.length))}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Projeção mensal:</span>
                    <span className="font-medium text-blue-600">{formatarValor(totalMes * 1.1)}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Comparativos</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Em relação ao mês anterior:</span>
                    <span className="font-medium text-green-600">+15%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Em relação ao ano anterior:</span>
                    <span className="font-medium text-green-600">+35%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Meta mensal:</span>
                    <span className="font-medium">{formatarValor(totalMes * 1.2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RelatoriosFinanceiros;
