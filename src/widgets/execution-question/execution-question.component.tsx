import { Box, Button, Stack, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { QuestionResponse } from '../../services/form';
import { QuestionTypeExecution } from './question-type-execution.component';

interface ExecutionFormProps {
  questionarioId: string;
}

export function ExecutionQuestion({ questionarioId }: ExecutionFormProps) {
  const [questions, setQuestions] = useState<QuestionResponse[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await api.get(`/questoes/${questionarioId}`);
        setQuestions(response.data);
      } catch (error) {
        console.error('Erro ao buscar questões:', error);
      }
    };

    fetchQuestions();
  }, [questionarioId]);

  const handleAnswer = (value: any) => {
    const currentQuestion = questions[currentQuestionIndex];
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      await api.post(`/respostas/${questionarioId}`, {
        respostas: Object.entries(answers).map(([questaoId, valor]) => ({
          questaoId,
          valor,
        })),
      });
      // Redirecionar para página de sucesso ou mostrar mensagem
    } catch (error) {
      console.error('Erro ao enviar respostas:', error);
    }
  };

  if (questions.length === 0) {
    return <Text>Carregando...</Text>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Box p={4}>
      <Stack spacing={4}>
        <Text>
          Questão {currentQuestionIndex + 1} de {questions.length}
        </Text>

        <QuestionTypeExecution
          type={currentQuestion.tipo}
          question={currentQuestion}
          onChange={handleAnswer}
          value={answers[currentQuestion.id]}
        />

        <Stack direction="row" spacing={4}>
          <Button
            onClick={handlePrevious}
            isDisabled={currentQuestionIndex === 0}
          >
            Anterior
          </Button>

          {currentQuestionIndex < questions.length - 1 ? (
            <Button onClick={handleNext}>Próxima</Button>
          ) : (
            <Button onClick={handleSubmit}>Enviar</Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
} 