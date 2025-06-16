import { Box } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { ExecutionQuestion } from '../../../widgets/execution-question/execution-question.component';

export default function ResponderFormularioPage() {
  const { id } = useParams();

  return (
    <Box p={8}>
      <ExecutionQuestion questionarioId={id ?? ""} />
    </Box>
  );
} 