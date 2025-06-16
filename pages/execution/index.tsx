// pages/form-builder.tsx
import ExecutionQuestion from "../../src/app/widgets/execution-question/execution-question.component";
import { Box } from "@chakra-ui/react";


export default function Execution() {
  return (
    <Box p={8}>
      <ExecutionQuestion questionarioId={0} alunoId={0} chave="" />
    </Box>
  );
}
