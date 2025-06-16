import { Box } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { ExecutionQuestion } from '../../../widgets/execution-question/execution-question.component';

export default function QuestionarioPage() {
  const { chave } = useParams();

  return (
    <Box p={8}>
      <ExecutionQuestion questionarioId={chave ?? ""} />
    </Box>
  );
} 