import { Box, Stack, Text } from '@chakra-ui/react';
import { QuestionResponse } from '../../services/form';

interface MultipleChoiceQuestionProps {
  question: QuestionResponse;
  onChange: (value: string) => void;
  value: string;
}

export function MultipleChoiceQuestion({
  question,
  onChange,
  value,
}: MultipleChoiceQuestionProps) {
  return (
    <Box>
      <Text mb={2}>{question.texto}</Text>
      <Stack gap={2}>
        {question.opcoes?.map((opcao) => (
          <Box key={opcao.id} as="label" cursor="pointer">
            <input
              type="radio"
              name={question.id}
              value={opcao.id}
              checked={value === opcao.id}
              onChange={(e) => onChange(e.target.value)}
            />
            <Text ml={2} display="inline">
              {opcao.texto}
            </Text>
          </Box>
        ))}
      </Stack>
    </Box>
  );
} 
