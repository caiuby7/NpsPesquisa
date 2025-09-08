import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Text,
  RadioGroup,
  Radio,
  Checkbox,
  CheckboxGroup,
  Stack,
  Select,
  Textarea,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Alert,
  AlertIcon,
  Divider,
  Badge
} from '@chakra-ui/react';
import { QuestionResponse, QuestionTypeEnum } from '../../app/services/form/form.services.types';
import { useConditionalQuestions } from '../../hooks/useConditionalQuestions';

interface ConditionalQuestionRendererProps {
  questions: QuestionResponse[];
  onAnswerChange?: (questionId: number, answer: any) => void;
  initialAnswers?: Map<number, any>;
  showConditionalIndicators?: boolean;
}

export const ConditionalQuestionRenderer: React.FC<ConditionalQuestionRendererProps> = ({
  questions,
  onAnswerChange,
  initialAnswers = new Map(),
  showConditionalIndicators = true
}) => {
  const {
    shouldShowQuestion,
    handleAnswer,
    getVisibleQuestions,
    answeredQuestions
  } = useConditionalQuestions(questions);

  const [localAnswers, setLocalAnswers] = useState<Map<number, any>>(initialAnswers);

  // Sincronizar respostas iniciais
  useEffect(() => {
    if (initialAnswers.size > 0) {
      initialAnswers.forEach((answer, questionId) => {
        handleAnswer(questionId, answer);
      });
    }
  }, [initialAnswers, handleAnswer]);

  const handleQuestionAnswer = (questionId: number, answer: any) => {
    setLocalAnswers(prev => new Map(prev.set(questionId, answer)));
    handleAnswer(questionId, answer);
    onAnswerChange?.(questionId, answer);
  };

  const renderQuestion = (question: QuestionResponse) => {
    if (!question || !question.id || !shouldShowQuestion(question.id)) return null;

    const currentAnswer = localAnswers.get(question.id);

    const isConditional = question.isCondicional;
    const hasConditionalOptions = question.opcoes?.some(opcao => opcao && opcao.ativaCondicao);

    return (
      <Box
        key={question.id}
        p={6}
        borderWidth="1px"
        borderRadius="md"
        bg="white"
        shadow="sm"
        mb={4}
      >
        <VStack spacing={4} align="stretch">
          {/* Cabeçalho da questão */}
          <Box>
            <Text fontSize="lg" fontWeight="semibold" mb={2}>
              {question.texto}
            </Text>
            {question.obrigatorio && (
              <Badge colorScheme="red" variant="subtle" mb={2}>
                Obrigatório
              </Badge>
            )}
            {isConditional && showConditionalIndicators && (
              <Badge colorScheme="purple" variant="subtle" mb={2}>
                Questão Condicional
              </Badge>
            )}
            {hasConditionalOptions && showConditionalIndicators && (
              <Badge colorScheme="blue" variant="subtle" mb={2}>
                Tem Opções Condicionais
              </Badge>
            )}
          </Box>

          <Divider />

          {/* Renderizar questão baseada no tipo */}
          {question.tipo === QuestionTypeEnum.MULTIPLE_CHOICE && (
            <RadioGroup
              value={currentAnswer}
              onChange={(value) => handleQuestionAnswer(question.id, value)}
            >
              <Stack spacing={2}>
                {question.opcoes?.filter(opcao => opcao && opcao.id).map((opcao) => (
                  <Box key={opcao.id} p={2} borderWidth="1px" borderRadius="md">
                    <Radio value={String(opcao.id)}>
                      {opcao.texto}
                    </Radio>
                    {opcao.ativaCondicao && showConditionalIndicators && (
                      <Text fontSize="xs" color="blue.500" ml={6}>
                        ⚡ Ativa questão condicional
                      </Text>
                    )}
                  </Box>
                ))}
              </Stack>
            </RadioGroup>
          )}

          {question.tipo === QuestionTypeEnum.MENU && (
            <Select
              placeholder="Selecione uma opção"
              value={currentAnswer || ''}
              onChange={(e) => handleQuestionAnswer(question.id, e.target.value)}
            >
              {question.opcoes?.filter(opcao => opcao && opcao.id).map((opcao) => (
                <option key={opcao.id} value={String(opcao.id)}>
                  {opcao.texto}
                </option>
              ))}
            </Select>
          )}

          {question.tipo === QuestionTypeEnum.TEXT_BOX && (
            <Textarea
              placeholder="Digite sua resposta"
              value={currentAnswer || ''}
              onChange={(e) => handleQuestionAnswer(question.id, e.target.value)}
              rows={4}
            />
          )}

          {question.tipo === QuestionTypeEnum.LINEAR_SCALE && question.opcoes && (
            <Box>
              <Text fontSize="sm" color="gray.600" mb={2}>
                {question.opcoes[0]?.texto} - {question.opcoes[1]?.texto}
              </Text>
              <Select
                placeholder="Selecione uma nota"
                value={currentAnswer || ''}
                onChange={(e) => handleQuestionAnswer(question.id, e.target.value)}
              >
                {Array.from({ length: 11 }, (_, i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </Select>
            </Box>
          )}

          {question.tipo === QuestionTypeEnum.MATRIX && (
            <Box>
              <Text fontSize="sm" color="gray.600" mb={4}>
                Matriz de opções
              </Text>
              <CheckboxGroup
                value={currentAnswer || []}
                onChange={(values) => handleQuestionAnswer(question.id, values)}
              >
                <Stack spacing={2}>
                  {question.opcoes?.filter(opcao => opcao && opcao.id).map((opcao) => (
                    <Checkbox key={opcao.id} value={String(opcao.id)}>
                      {opcao.texto}
                    </Checkbox>
                  ))}
                </Stack>
              </CheckboxGroup>
            </Box>
          )}
        </VStack>
      </Box>
    );
  };

  const visibleQuestions = getVisibleQuestions();

  // Debug: Log das questões visíveis
  console.log('🔍 Debug - Questões visíveis:', {
    totalQuestions: questions.length,
    visibleCount: visibleQuestions.length,
    visibleIds: visibleQuestions.map(q => q.id),
    allQuestions: questions.map(q => ({ id: q.id, texto: q.texto, isCondicional: q.isCondicional }))
  });

  if (visibleQuestions.length === 0) {
    return (
      <Alert status="info">
        <AlertIcon />
        Nenhuma questão disponível no momento.
      </Alert>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      {visibleQuestions.map(renderQuestion)}
    </VStack>
  );
};
