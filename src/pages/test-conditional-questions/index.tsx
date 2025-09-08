import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Button,
  Text,
  Alert,
  AlertIcon,
  Badge,
  HStack,
  Divider,
  Code
} from '@chakra-ui/react';
import { MainLayout } from '../../components/layout/main-layout.component';
import { ConditionalQuestionRenderer } from '../../components/ConditionalQuestionRenderer/ConditionalQuestionRenderer';
import { useGetQuestions } from '../../services/question';
import { QuestionResponse } from '../../app/services/form/form.services.types';

const TestConditionalQuestionsPage: React.FC = () => {
  const { data: questions, isLoading, error } = useGetQuestions();
  const [answers, setAnswers] = useState<Map<number, any>>(new Map());
  const [showDebug, setShowDebug] = useState(false);

  const handleAnswerChange = (questionId: number, answer: any) => {
    setAnswers(prev => new Map(prev.set(questionId, answer)));
  };

  const resetAnswers = () => {
    setAnswers(new Map());
  };

  const getAnswerSummary = () => {
    return Object.fromEntries(answers);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <Box p={6} maxW="1200px" mx="auto">
          <Text>Carregando questões...</Text>
        </Box>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <Box p={6} maxW="1200px" mx="auto">
          <Alert status="error">
            <AlertIcon />
            Erro ao carregar questões: {error.message}
          </Alert>
        </Box>
      </MainLayout>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <MainLayout>
        <Box p={6} maxW="1200px" mx="auto">
          <Alert status="info">
            <AlertIcon />
            Nenhuma questão encontrada. Crie algumas questões primeiro.
          </Alert>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box p={6} maxW="1200px" mx="auto">
        <VStack spacing={6} align="stretch">
          <Box>
            <Heading mb={4}>🧪 Teste de Questões Condicionais</Heading>
            <Text color="gray.600" mb={4}>
              Teste a funcionalidade de questões condicionais. Responda às questões e veja como as questões condicionais aparecem baseadas nas suas respostas.
            </Text>
            
            <HStack spacing={4} mb={4}>
              <Button onClick={resetAnswers} colorScheme="gray" variant="outline">
                Limpar Respostas
              </Button>
              <Button 
                onClick={() => setShowDebug(!showDebug)} 
                colorScheme="blue" 
                variant="outline"
              >
                {showDebug ? 'Ocultar' : 'Mostrar'} Debug
              </Button>
            </HStack>
          </Box>

          <Divider />

          {/* Estatísticas */}
          <Box p={4} bg="gray.50" borderRadius="md">
            <Text fontWeight="semibold" mb={2}>📊 Estatísticas</Text>
            <HStack spacing={4}>
              <Badge colorScheme="blue">
                Total: {questions.length} questões
              </Badge>
              <Badge colorScheme="purple">
                Condicionais: {questions.filter(q => (q as any).isCondicional).length}
              </Badge>
              <Badge colorScheme="green">
                Respondidas: {answers.size}
              </Badge>
            </HStack>
          </Box>

          {/* Renderizador de questões condicionais */}
          <ConditionalQuestionRenderer
            questions={questions}
            onAnswerChange={handleAnswerChange}
            initialAnswers={answers}
            showConditionalIndicators={true}
          />

          {/* Debug Panel */}
          {showDebug && (
            <Box p={4} bg="gray.100" borderRadius="md">
              <Text fontWeight="semibold" mb={2}>🔍 Debug - Respostas Atuais</Text>
              <Code p={4} display="block" whiteSpace="pre-wrap">
                {JSON.stringify(getAnswerSummary(), null, 2)}
              </Code>
              
              <Text fontWeight="semibold" mb={2} mt={4}>🔍 Debug - Questões Condicionais</Text>
              <Code p={4} display="block" whiteSpace="pre-wrap">
                {JSON.stringify(
                  questions
                    .filter(q => q.isCondicional)
                    .map(q => ({
                      id: q.id,
                      texto: q.texto,
                      isCondicional: q.isCondicional,
                      opcoes: q.opcoes?.map(opcao => ({
                        id: opcao.id,
                        texto: opcao.texto,
                        ativaCondicao: opcao.ativaCondicao,
                        questaoCondicionalId: opcao.questaoCondicionalId
                      }))
                    })), 
                  null, 
                  2
                )}
              </Code>
            </Box>
          )}

          {/* Instruções */}
          <Box p={4} bg="blue.50" borderRadius="md">
            <Text fontWeight="semibold" mb={2}>💡 Como Testar</Text>
            <VStack spacing={2} align="start">
              <Text fontSize="sm">
                1. Crie uma questão principal (ex: "Como você avalia o serviço?")
              </Text>
              <Text fontSize="sm">
                2. Marque "Questão Condicional?" na questão principal
              </Text>
              <Text fontSize="sm">
                3. Nas opções, marque "Ativa condição" e selecione uma questão condicional
              </Text>
              <Text fontSize="sm">
                4. Volte aqui e teste respondendo a questão principal
              </Text>
              <Text fontSize="sm">
                5. A questão condicional deve aparecer quando você selecionar a opção que ativa a condição
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Box>
    </MainLayout>
  );
};

export default TestConditionalQuestionsPage;
