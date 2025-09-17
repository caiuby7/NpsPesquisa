import React from 'react';
import { Box, VStack, Text, useToast } from '@chakra-ui/react';
import InstitutionalEvaluationLayout from '../../components/InstitutionalEvaluationLayout/InstitutionalEvaluationLayout';
import { useInstitutionalEvaluation, Discipline } from '../../hooks/useInstitutionalEvaluation';

const InstitutionalEvaluationExample: React.FC = () => {
  const toast = useToast();

  // Dados de exemplo das disciplinas
  const disciplines: Discipline[] = [
    {
      id: 'poo',
      name: 'Programação Orientada a Objetos',
      icon: 'book',
      aspects: [
        'Qualidade do conteúdo',
        'Metodologia de ensino',
        'Disponibilidade do professor',
        'Recursos disponíveis',
        'Avaliação e feedback'
      ]
    },
    {
      id: 'bd',
      name: 'Banco de Dados',
      icon: 'database',
      aspects: [
        'Qualidade do conteúdo',
        'Metodologia de ensino',
        'Disponibilidade do professor',
        'Recursos disponíveis',
        'Avaliação e feedback'
      ]
    },
    {
      id: 'web',
      name: 'Desenvolvimento Web',
      icon: 'globe',
      aspects: [
        'Qualidade do conteúdo',
        'Metodologia de ensino',
        'Disponibilidade do professor',
        'Recursos disponíveis',
        'Avaliação e feedback'
      ]
    },
    {
      id: 'mobile',
      name: 'Desenvolvimento Mobile',
      icon: 'smartphone',
      aspects: [
        'Qualidade do conteúdo',
        'Metodologia de ensino',
        'Disponibilidade do professor',
        'Recursos disponíveis',
        'Avaliação e feedback'
      ]
    },
    {
      id: 'seguranca',
      name: 'Segurança da Informação',
      icon: 'shield',
      aspects: [
        'Qualidade do conteúdo',
        'Metodologia de ensino',
        'Disponibilidade do professor',
        'Recursos disponíveis',
        'Avaliação e feedback'
      ]
    },
    {
      id: 'ia',
      name: 'Inteligência Artificial',
      icon: 'cpu',
      aspects: [
        'Qualidade do conteúdo',
        'Metodologia de ensino',
        'Disponibilidade do professor',
        'Recursos disponíveis',
        'Avaliação e feedback'
      ]
    },
    {
      id: 'estatistica',
      name: 'Estatística Aplicada',
      icon: 'bar-chart',
      aspects: [
        'Qualidade do conteúdo',
        'Metodologia de ensino',
        'Disponibilidade do professor',
        'Recursos disponíveis',
        'Avaliação e feedback'
      ]
    }
  ];

  const {
    evaluationData,
    currentSection,
    totalSections,
    progress,
    isNextDisabled,
    handleEvaluationChange,
    handleNext,
    handlePrevious,
    resetEvaluation
  } = useInstitutionalEvaluation({
    disciplines,
    onEvaluationComplete: (data) => {
      toast({
        title: 'Avaliação Concluída!',
        description: `Você avaliou ${data.length} aspectos. Obrigado pela sua participação!`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      console.log('Dados da avaliação:', data);
    }
  });

  const handleNextWithValidation = () => {
    if (isNextDisabled) {
      toast({
        title: 'Avaliação Incompleta',
        description: 'Por favor, responda todas as questões antes de continuar.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    handleNext();
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <InstitutionalEvaluationLayout
        title="Avaliação Institucional"
        subtitle="Católica SC - 2024.1"
        progress={progress}
        totalSections={totalSections}
        currentSection={currentSection}
        disciplines={disciplines}
        evaluationData={evaluationData}
        onEvaluationChange={handleEvaluationChange}
        onPrevious={handlePrevious}
        onNext={handleNextWithValidation}
        isNextDisabled={isNextDisabled}
      />
      
      {/* Debug Info - Remover em produção */}
      <Box position="fixed" bottom={4} right={4} bg="white" p={4} borderRadius="md" boxShadow="lg" maxW="300px">
        <VStack align="start" spacing={2}>
          <Text fontSize="sm" fontWeight="bold">Debug Info:</Text>
          <Text fontSize="xs">Progresso: {progress.toFixed(1)}%</Text>
          <Text fontSize="xs">Seção: {currentSection}/{totalSections}</Text>
          <Text fontSize="xs">Respostas: {evaluationData.length}</Text>
          <Text fontSize="xs">Total esperado: {disciplines.reduce((total, d) => total + d.aspects.length, 0)}</Text>
        </VStack>
      </Box>
    </Box>
  );
};

export default InstitutionalEvaluationExample;
