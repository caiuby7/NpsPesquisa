import { useParams, useNavigate } from "react-router-dom";
import { Box, Button, Heading } from "@chakra-ui/react";
import { AppHeader } from "../../components/header/header.component";

export default function RespostasFormularioPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <Box>
      <AppHeader />
      <Box p={8} maxW="900px" m="auto">
        <Heading mb={8}>Respostas do Formulário #{id}</Heading>
        <Button colorScheme="gray" onClick={() => navigate("/formularios")}>Voltar</Button>
      </Box>
    </Box>
  );
} 