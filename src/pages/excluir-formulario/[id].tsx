import { useParams, useNavigate } from "react-router-dom";
import { Box, Button, Heading, Text } from "@chakra-ui/react";
import { AppHeader } from "../../components/header/header.component";
import axios from "axios";

export default function ExcluirFormularioPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/Questionario/${id}`);
      navigate("/formularios");
    } catch (error) {
      console.error("Erro ao excluir o formulário:", error);
    }
  };

  return (
    <Box>
      <AppHeader />
      <Box p={8} maxW="900px" m="auto">
        <Heading mb={4}>Excluir Formulário #{id}</Heading>
        <Text mb={8}>Tem certeza que deseja excluir este formulário?</Text>
        <Button colorScheme="gray" onClick={handleDelete}>Excluir</Button>
        <Button colorScheme="gray" onClick={() => navigate("/formularios")}>Voltar</Button>
      </Box>
    </Box>
  );
} 