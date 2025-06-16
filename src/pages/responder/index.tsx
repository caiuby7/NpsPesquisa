import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Box, Button, Input, Heading, Stack, Flex, Image, Text } from "@chakra-ui/react";
import { MdKey } from "react-icons/md";

interface FormData {
  chave: string;
}

export default function ResponderPage() {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    navigate(`/questionario/${data.chave}`);
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
        <Heading mb={4} color="#9d2235" fontSize="2xl">Pesquisa de Satisfação - NPS</Heading>
        <Text mb={8} color="gray.600">
          Por favor, digite o código enviado por email e clique em responder
        </Text>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack mb={8}>
            <Flex align="center" bg="white" borderRadius="md">
              <Box p={3}>
                <MdKey color="#9d2235" size={24} />
              </Box>
              <Input 
                {...register('chave')} 
                required 
                placeholder="Digite o código do questionário"
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
            Responder
          </Button>
        </form>
      </Box>
    </Box>
  );
} 