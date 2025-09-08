import { useState, useCallback, useMemo } from 'react';

export interface EvaluationData {
  disciplineId: string;
  aspectId: string;
  value: string;
}

export interface Discipline {
  id: string;
  name: string;
  icon: string;
  aspects: string[];
}

export interface UseInstitutionalEvaluationProps {
  disciplines: Discipline[];
  onEvaluationComplete?: (data: EvaluationData[]) => void;
}

export const useInstitutionalEvaluation = ({
  disciplines,
  onEvaluationComplete
}: UseInstitutionalEvaluationProps) => {
  const [evaluationData, setEvaluationData] = useState<EvaluationData[]>([]);
  const [currentSection, setCurrentSection] = useState(1);
  const [totalSections] = useState(8); // Exemplo: 8 seções

  const handleEvaluationChange = useCallback((disciplineId: string, aspectId: string, value: string) => {
    setEvaluationData(prev => {
      const existingIndex = prev.findIndex(
        item => item.disciplineId === disciplineId && item.aspectId === aspectId
      );

      if (existingIndex >= 0) {
        // Atualizar avaliação existente
        const updated = [...prev];
        updated[existingIndex] = { disciplineId, aspectId, value };
        return updated;
      } else {
        // Adicionar nova avaliação
        return [...prev, { disciplineId, aspectId, value }];
      }
    });
  }, []);

  const progress = useMemo(() => {
    const totalQuestions = disciplines.reduce((total, discipline) => 
      total + discipline.aspects.length, 0
    );
    const answeredQuestions = evaluationData.length;
    return totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
  }, [disciplines, evaluationData.length]);

  const isNextDisabled = useMemo(() => {
    const totalQuestions = disciplines.reduce((total, discipline) => 
      total + discipline.aspects.length, 0
    );
    return evaluationData.length < totalQuestions;
  }, [disciplines, evaluationData.length]);

  const handleNext = useCallback(() => {
    if (!isNextDisabled) {
      if (currentSection < totalSections) {
        setCurrentSection(prev => prev + 1);
      } else {
        // Avaliação completa
        onEvaluationComplete?.(evaluationData);
      }
    }
  }, [currentSection, totalSections, isNextDisabled, evaluationData, onEvaluationComplete]);

  const handlePrevious = useCallback(() => {
    if (currentSection > 1) {
      setCurrentSection(prev => prev - 1);
    }
  }, [currentSection]);

  const getDisciplineProgress = useCallback((disciplineId: string) => {
    const discipline = disciplines.find(d => d.id === disciplineId);
    if (!discipline) return 0;
    
    const answeredAspects = evaluationData.filter(
      e => e.disciplineId === disciplineId
    ).length;
    
    return (answeredAspects / discipline.aspects.length) * 100;
  }, [disciplines, evaluationData]);

  const getEvaluationValue = useCallback((disciplineId: string, aspectId: string) => {
    const evaluation = evaluationData.find(
      e => e.disciplineId === disciplineId && e.aspectId === aspectId
    );
    return evaluation?.value || '';
  }, [evaluationData]);

  const resetEvaluation = useCallback(() => {
    setEvaluationData([]);
    setCurrentSection(1);
  }, []);

  return {
    evaluationData,
    currentSection,
    totalSections,
    progress,
    isNextDisabled,
    handleEvaluationChange,
    handleNext,
    handlePrevious,
    getDisciplineProgress,
    getEvaluationValue,
    resetEvaluation
  };
};
