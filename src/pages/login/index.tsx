// pages/login.tsx
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import nookies from "nookies";
import { Box, Button, Input, Heading, Stack, Flex, Image } from "@chakra-ui/react";
import {
  LoginParams,
  LoginResponse,
  useLoginMutate,
} from "@/app/services/login";
import { MdEmail, MdLock } from "react-icons/md";

export default function LoginPage() {
  const handleMutationSuccess = (data: LoginResponse) => {
    nookies.set(null, "token", data.token, {
      path: "/",
      maxAge: 60 * 60 * 24, // 1 dia
    });

    router.push("/home");
  };

  const handleMutationError = () => {
    console.log("error");
  };

  const { mutate: login, isPending } = useLoginMutate(
    handleMutationSuccess,
    handleMutationError
  );

  const { register, handleSubmit } = useForm<LoginParams>();
  const router = useRouter();

  const onSubmit = async (data: LoginParams) => {
    try {
      login(data);
    } catch (err) {console.log(err)}
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
        <Heading mb={8} color="#9d2235" fontSize="2xl">Pesquisa NPS</Heading>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack mb={6}>
            <Flex align="center" bg="white" borderRadius="md">
              <Box p={3}>
                <MdEmail color="#9d2235" size={24} />
              </Box>
              <Input 
                type="email" 
                {...register('email')} 
                required 
                placeholder="Digite seu email"
                border="none"
                _focus={{ border: "none" }}
                fontSize="lg"
                py={6}
              />
            </Flex>
          </Stack>
          <Stack mb={8}>
            <Flex align="center" bg="white" borderRadius="md">
              <Box p={3}>
                <MdLock color="#9d2235" size={24} />
              </Box>
              <Input 
                type="password" 
                {...register('senha')} 
                required 
                placeholder="Digite sua senha"
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
            loading={isPending}
          >
            Entrar
          </Button>
        </form>
      </Box>
    </Box>
  );
}
