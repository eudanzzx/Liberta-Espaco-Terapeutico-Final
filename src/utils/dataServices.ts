
import useUserDataService from "@/services/userDataService";

// Function to save a new atendimento
export const saveNewAtendimento = (atendimento, userDataService) => {
  const { getAtendimentos, saveAtendimentos } = userDataService;
  
  // Get current atendimentos
  const currentAtendimentos = getAtendimentos();
  
  // Add the new one
  const updatedAtendimentos = [...currentAtendimentos, atendimento];
  
  // Save all
  saveAtendimentos(updatedAtendimentos);
  
  return atendimento;
};

// Function to update an existing atendimento
export const updateAtendimento = (id, updatedAtendimento, userDataService) => {
  const { getAtendimentos, saveAtendimentos } = userDataService;
  
  // Get current atendimentos
  const currentAtendimentos = getAtendimentos();
  
  // Find and update the specific one
  const updatedAtendimentos = currentAtendimentos.map(atendimento => 
    atendimento.id === id ? { ...atendimento, ...updatedAtendimento } : atendimento
  );
  
  // Save all
  saveAtendimentos(updatedAtendimentos);
  
  return updatedAtendimento;
};

// Function to save a new tarot analysis
export const saveNewTarotAnalysis = (analysis, userDataService) => {
  const { getTarotAnalyses, saveTarotAnalyses } = userDataService;
  
  // Get current analyses
  const currentAnalyses = getTarotAnalyses();
  
  // Add the new one
  const updatedAnalyses = [...currentAnalyses, analysis];
  
  // Save all
  saveTarotAnalyses(updatedAnalyses);
  
  return analysis;
};

// Function to update an existing tarot analysis
export const updateTarotAnalysis = (id, updatedAnalysis, userDataService) => {
  const { getTarotAnalyses, saveTarotAnalyses } = userDataService;
  
  // Get current analyses
  const currentAnalyses = getTarotAnalyses();
  
  // Find and update the specific one
  const updatedAnalyses = currentAnalyses.map(analysis => 
    analysis.id === id ? { ...analysis, ...updatedAnalysis } : analysis
  );
  
  // Save all
  saveTarotAnalyses(updatedAnalyses);
  
  return updatedAnalysis;
};
