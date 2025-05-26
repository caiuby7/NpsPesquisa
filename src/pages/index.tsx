// pages/form-builder.tsx
import { Box, Heading } from "@chakra-ui/react";
import CreateQuestion from "@/app/features/create-question/create-question.component";
import ExecutionQuestion from "@/app/features/execution-question/execution-question.component";

export default function FormBuilderPage() {
  return (
    <Box p={8}>
      <Heading mb={6}>Criar Questão</Heading>
      <CreateQuestion />
      <ExecutionQuestion />
    </Box>
  );
}
