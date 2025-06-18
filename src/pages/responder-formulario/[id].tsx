import { useParams, useNavigate } from "react-router-dom";
import { Box, Button, Heading, Stack } from "@chakra-ui/react";
import { AppHeader } from "../../components/header/header.component";
import ExecutionForm from "../../app/widgets/execution-question/execution-question.component";
import axios from "axios";

export default function ResponderFormularioPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <Box
      minH="100vh"
      bgImage="url('/background.jpg')"
      bgSize="cover"
      backgroundPosition="center"
      bgRepeat="no-repeat"
      display="flex"
      flexDirection="column"
    >
      <AppHeader />
      <Box p={8} maxW="900px" m="auto" bg="rgba(255,255,255,0.92)" borderRadius="lg" boxShadow="lg">
        <Stack gap={8}>
          <Heading>Responder Formulário</Heading>
          <Button colorScheme="gray" onClick={() => navigate("/formularios")}>Voltar</Button>
          {id && (
            <ExecutionForm questionarioId={0} alunoId={0} chave={String(id)} />
          )}
        </Stack>
      </Box>
    </Box>
  );
} 