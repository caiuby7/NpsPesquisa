import { useParams, useNavigate } from "react-router-dom";
import { Box, Button, Heading } from "@chakra-ui/react";
import { AppHeader } from "../../components/header/header.component";
import { api } from "../../services/api";
import { useEffect, useState } from "react";

export default function RespostasFormularioPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [respostas, setRespostas] = useState([]);

  useEffect(() => {
    const fetchRespostas = async () => {
      const response = await api.get(`/Questionario/${id}/respostas`);
      setRespostas(response.data);
    };
    fetchRespostas();
  }, [id]);

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