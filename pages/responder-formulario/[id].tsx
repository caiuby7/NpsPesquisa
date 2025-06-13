import { useRouter } from "next/router";
import { Box, Button, Heading, Stack } from "@chakra-ui/react";
import { AppHeader } from "@/app/features/header/header.component";
import ExecutionForm from "@/app/widgets/execution-question/execution-question.component";

export default function ResponderFormularioPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <Box>
      <AppHeader />
      <Box p={8} maxW="900px" m="auto">
        <Stack gap={8}>
          <Heading>Responder Formulário</Heading>
          <Button colorScheme="gray" onClick={() => router.push("/formularios")}>Voltar</Button>
          <ExecutionForm />
        </Stack>
      </Box>
    </Box>
  );
} 