import { useRouter } from "next/router";
import { Box, Button, Heading, Text } from "@chakra-ui/react";
import { AppHeader } from "../../src/app/features/header/header.component";

export default function ExcluirFormularioPage() {
  const router = useRouter();
  const { id } = router.query;
  return (
    <Box>
      <AppHeader />
      <Box p={8} maxW="900px" m="auto">
        <Heading mb={4}>Excluir Formulário #{id}</Heading>
        <Text mb={8}>Tem certeza que deseja excluir este formulário?</Text>
        <Button colorScheme="gray" onClick={() => router.push("/formularios")}>Voltar</Button>
      </Box>
    </Box>
  );
} 