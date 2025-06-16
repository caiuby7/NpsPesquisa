import { useParams, useNavigate } from "react-router-dom";
import { Box, Button, Heading, Text } from "@chakra-ui/react";
import { AppHeader } from "../../components/header/header.component";

export default function ExcluirFormularioPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <Box>
      <AppHeader />
      <Box p={8} maxW="900px" m="auto">
        <Heading mb={4}>Excluir Formulário #{id}</Heading>
        <Text mb={8}>Tem certeza que deseja excluir este formulário?</Text>
        <Button colorScheme="gray" onClick={() => navigate("/formularios")}>Voltar</Button>
      </Box>
    </Box>
  );
} 