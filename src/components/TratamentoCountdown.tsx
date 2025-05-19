
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { BellRing, Calendar, Clock, AlertTriangle, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";

const TratamentoCountdown = ({ analises }) => {
  const navigate = useNavigate();
  const hoje = new Date();
  const [dismissedTreatments, setDismissedTreatments] = useState(() => {
    const saved = localStorage.getItem("dismissedTreatments");
    return saved ? JSON.parse(saved) : [];
  });
  
  // Filtrar e processar todos os tratamentos ativos
  const tratamentosAtivos = [];
  
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
      
      // Adicionar apenas se não tiver expirado ou estiver próximo de expirar (7 dias)
      // E se não estiver na lista de descartados
      const treatmentKey = `${analise.id}-${lembrete.texto}`;
      if (diffDays > -1 && diffDays <= 7 && !dismissedTreatments.includes(treatmentKey)) {
        tratamentosAtivos.push({
          id: analise.id,
          clienteId: analise.id,
          clienteNome: analise.nomeCliente,
          tratamento: lembrete.texto,
          diasRestantes: diffDays,
          horasRestantes: diffHours,
          dataExpiracao,
          treatmentKey
        });
      }
    });
  });
  
  // Ordenar por proximidade de expiração
  tratamentosAtivos.sort((a, b) => a.diasRestantes - b.diasRestantes);
  
  useEffect(() => {
    // Salvar tratamentos descartados no localStorage
    localStorage.setItem("dismissedTreatments", JSON.stringify(dismissedTreatments));
  }, [dismissedTreatments]);
  
  const handleDismiss = (e, treatmentKey) => {
    e.stopPropagation();
    setDismissedTreatments(prev => [...prev, treatmentKey]);
    toast({
      title: "Notificação descartada",
      description: "A notificação de tratamento foi escondida",
      variant: "default",
    });
  };
  
  if (tratamentosAtivos.length === 0) {
    return null;
  }

  const handleCardClick = (clienteId) => {
    navigate(`/editar-analise-frequencial/${clienteId}`);
  };
  
  const handleReset = () => {
    setDismissedTreatments([]);
    toast({
      title: "Notificações restauradas",
      description: "Todas as notificações de tratamento foram restauradas",
      variant: "default",
    });
  };
  
  return (
    <Card className="mb-6 border-yellow-200 bg-yellow-50 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="py-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <BellRing className="h-5 w-5 text-yellow-600 animate-pulse" />
            <span className="text-yellow-800">Tratamentos em andamento</span>
          </h3>
          {dismissedTreatments.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleReset}
              className="text-xs text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 transition-all duration-300"
            >
              Mostrar todos
            </Button>
          )}
        </div>
        
        <div className="space-y-3">
          {tratamentosAtivos.slice(0, 5).map((tratamento, index) => (
            <div 
              key={index} 
              onClick={() => handleCardClick(tratamento.clienteId)}
              className={`p-3 rounded-md border flex justify-between items-center cursor-pointer transform transition-all duration-300 hover:scale-[1.02] group ${
                tratamento.diasRestantes <= 0 ? "bg-red-100 border-red-300 hover:bg-red-200" : 
                tratamento.diasRestantes <= 1 ? "bg-orange-100 border-orange-300 hover:bg-orange-200" : 
                "bg-white border-gray-200 hover:bg-gray-50"
              } animate-fade-in`}
              style={{animationDelay: `${index * 100}ms`}}
            >
              <div className="flex-grow">
                <p className="font-medium group-hover:text-blue-700 transition-colors">{tratamento.clienteNome}</p>
                <p className="text-sm text-gray-600 mt-1 group-hover:text-gray-800 transition-colors">{tratamento.tratamento}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Calendar className="h-4 w-4 text-gray-500 group-hover:text-blue-500 transition-colors" />
                  <p className="text-xs text-gray-500">
                    {tratamento.dataExpiracao.toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              
              <div className="text-right flex flex-col items-end">
                <div className="flex items-center gap-2">
                  {tratamento.diasRestantes <= 0 ? (
                    <span className="text-red-600 font-medium flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1 animate-pulse" />
                      Expirado!
                    </span>
                  ) : tratamento.diasRestantes <= 1 ? (
                    <span className="text-orange-600 font-medium flex items-center">
                      <Clock className="h-4 w-4 mr-1 animate-pulse" />
                      {tratamento.horasRestantes} horas restantes
                    </span>
                  ) : (
                    <span className="text-blue-600 font-medium">
                      {tratamento.diasRestantes} dias restantes
                    </span>
                  )}
                  
                  <button 
                    onClick={(e) => handleDismiss(e, tratamento.treatmentKey)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-200 transition-all duration-300"
                    aria-label="Descartar notificação"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                </div>
                
                <div className="mt-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-xs hover:bg-blue-50 transition-colors group-hover:bg-blue-100 group-hover:text-blue-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/editar-analise-frequencial/${tratamento.clienteId}`);
                    }}
                  >
                    Ver análise
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {tratamentosAtivos.length > 5 && (
            <p className="text-sm text-center text-gray-600 animate-fade-in" style={{animationDelay: '500ms'}}>
              + {tratamentosAtivos.length - 5} outros tratamentos em andamento
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TratamentoCountdown;
