import { useParams } from "react-router-dom";
import ExecutionQuestion from "../../app/widgets/execution-question/execution-question.component";
import { Box, Heading, Text, Spinner, Alert, AlertIcon } from "@chakra-ui/react";

export default function Execution() {
  const { questionarioId, chave, participanteId } = useParams();

  // Validação dos parâmetros obrigatórios
  if (!questionarioId || !chave || !participanteId) {
    return (
      <Box p={8} textAlign="center">
        <Alert status="error">
          <AlertIcon />
          Parâmetros inválidos. É necessário fornecer o ID do questionário, a chave de acesso e o ID do participante.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={8} maxW="800px" mx="auto">
      <Heading mb={6} textAlign="center">Responder Questionário</Heading>
      <ExecutionQuestion 
        questionarioId={parseInt(questionarioId) || 0} 
        chave={chave}
        participanteId={parseInt(participanteId) || 0}
      />
    </Box>
  );
} 