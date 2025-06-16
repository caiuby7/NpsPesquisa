import { useRouter } from "next/router";
import { Box, Button, Heading, Stack } from "@chakra-ui/react";
import { AppHeader } from "../../src/app/features/header/header.component";
import ExecutionForm from "../../src/app/widgets/execution-question/execution-question.component";

export default function ResponderFormularioPage() {
  const router = useRouter();
  const { id } = router.query;

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
          <Button colorScheme="gray" onClick={() => router.push("/formularios")}>Voltar</Button>
          {id && (
            <ExecutionForm questionarioId={0} alunoId={0} chave={String(id)} />
          )}
        </Stack>
      </Box>
    </Box>
  );
} 