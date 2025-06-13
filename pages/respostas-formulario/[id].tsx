import { useRouter } from "next/router";
import { Box, Button, Heading } from "@chakra-ui/react";
import { AppHeader } from "@/app/features/header/header.component";

export default function RespostasFormularioPage() {
  const router = useRouter();
  const { id } = router.query;
  return (
    <Box>
      <AppHeader />
      <Box p={8} maxW="900px" m="auto">
        <Heading mb={8}>Respostas do Formulário #{id}</Heading>
        <Button colorScheme="gray" onClick={() => router.push("/formularios")}>Voltar</Button>
      </Box>
    </Box>
  );
} 