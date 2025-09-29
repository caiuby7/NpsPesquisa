import { Box } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import CreateQuestionComponent from '../../../widgets/create-question/create-question.component';

export default function EditQuestionsPage() {
  const { id } = useParams();

  return (
    <Box p={8}>
      <CreateQuestionComponent initialData={{ id: id }} />
    </Box>
  );
} 
