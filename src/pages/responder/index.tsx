import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Heading, Input, Stack, Flex, Image, Text } from "@chakra-ui/react";
import { MdKey } from "react-icons/md";

export default function ResponderPage() {
  const [chave, setChave] = useState("");
  const navigate = useNavigate();

  const handleAcessar = (e: React.FormEvent) => {
    e.preventDefault();
    if (chave.trim()) {
      navigate(`/questionario/${chave}`);
    }
  };

  return (
    <Box
      minH="100vh"
      bgImage="url('/background.jpg')"
      bgSize="cover"
      backgroundPosition="center"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <Image src="/logo.png" alt="Logo" mb={8} maxW="200px" />
      <Box
        maxW="600px"
        p={10}
        borderWidth={1}
        borderRadius="lg"
        bg="rgba(255, 255, 255, 0.3)"
        backdropFilter="blur(8px)"
        shadow="lg"
      >
        <Heading mb={8} color="#9d2235" fontSize="2xl" textAlign="center">
          Acessar Questionário
        </Heading>
        <form onSubmit={handleAcessar}>
          <Stack mb={8}>
            <Flex align="center" bg="white" borderRadius="md">
              <Box p={3}>
                <MdKey color="#9d2235" size={24} />
              </Box>
              <Input
                placeholder="Digite a chave do questionário"
                value={chave}
                onChange={e => setChave(e.target.value)}
                required
                border="none"
                _focus={{ border: "none" }}
                fontSize="lg"
                py={6}
              />
            </Flex>
          </Stack>
          <Button
            bg="#9d2235"
            _hover={{ bg: "#7a1a29" }}
            color="white"
            type="submit"
            width="full"
            py={6}
            fontSize="lg"
          >
            Acessar
          </Button>
        </form>
      </Box>
    </Box>
  );
} 