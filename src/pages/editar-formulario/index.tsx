import { Box } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { CreateForm } from '../../widgets/create-form/create-form.component';

export default function EditFormPage() {
  const { id } = useParams();

  return (
    <Box p={8}>
      <CreateForm initialData={{ id: id }} />
    </Box>
  );
} 