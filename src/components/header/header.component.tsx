import { Box, Button, Flex, Heading, HStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export function AppHeader() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box bg="white" px={8} py={4} shadow="sm">
      <Flex justify="space-between" align="center" maxW="1200px" m="auto">
        <Heading size="md" color="#9d2235">Pesquisa NPS</Heading>
        <HStack spacing={6}>
          <Button variant="ghost" onClick={() => navigate("/home")}>Home</Button>
          <Button variant="ghost" onClick={() => navigate("/formularios")}>Formulários</Button>
          <Button variant="ghost" onClick={() => navigate("/questions")}>Questões</Button>
          <Button variant="ghost" onClick={() => navigate("/cursos")}>Cursos</Button>
          <Button variant="ghost" onClick={() => navigate("/participantes")}>Participantes</Button>
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>Dashboard</Button>
          <Button colorScheme="red" variant="outline" onClick={handleLogout}>Sair</Button>
        </HStack>
      </Flex>
    </Box>
  );
} 