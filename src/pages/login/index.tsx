import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Box, Button, Input, Heading, Stack, Flex, Image, useToast } from "@chakra-ui/react";
import { useLoginMutate } from "../../app/services/login";
import { useAuth } from "../../contexts/AuthContext";
import { MdEmail, MdLock } from "react-icons/md";

interface LoginParams {
  email: string;
  senha: string;
}

interface LoginResponse {
  token: string;
  nome: string;
  email: string;
  perfil: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { register, handleSubmit } = useForm<LoginParams>();
  const toast = useToast();

  const handleMutationSuccess = (data: LoginResponse) => {
    // Salvar token e dados do usuário
    Cookies.set("token", data.token, {
      expires: 7, // 7 dias
      path: "/",
      secure: false, // Para desenvolvimento local
      sameSite: 'lax'
    });
    localStorage.setItem("token", data.token);

    // Atualizar o contexto de autenticação
    login(data.token, {
      id: data.email, // Usando email como ID temporário
      name: data.nome,
      email: data.email,
      perfil: data.perfil
    });

    // Redirecionar baseado no perfil
    switch (data.perfil.toLowerCase()) {
      case 'aluno':
        navigate("/participante/dashboard");
        break;
      case 'professor':
        navigate("/professor/dashboard");
        break;
      case 'cpa':
        navigate("/cpa/dashboard");
        break;
      case 'administrador':
        navigate("/home");
        break;
      case 'coordenador':
        navigate("/coordenador/dashboard");
        break;
      default:
        navigate("/home");
    }
  };

  const { mutate: loginMutate, isPending } = useLoginMutate(handleMutationSuccess);

  const onSubmit = async (data: LoginParams) => {
    try {
      loginMutate(data, {
        onError: (error: any) => {
          if (error?.response?.status === 400 && error?.response?.data?.message === "Usuário ou senha inválidos") {
            toast({
              title: "Usuário ou senha inválidos",
              status: "error",
              duration: 10000,
              isClosable: true,
              position: "top"
            });
            return;
          }
          toast({
            title: "Erro ao fazer login.",
            description: "Tente novamente mais tarde.",
            status: "error",
            duration: 4000,
            isClosable: true,
            position: "top"
          });
        }
      });
    } catch (err) {
      // fallback
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
        <Heading mb={8} color="#9d2235" fontSize="2xl">Avaliação Institucional</Heading>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack mb={6}>
            <Flex align="center" bg="white" borderRadius="md">
              <Box p={3}>
                <MdEmail color="#9d2235" size={24} />
              </Box>
              <Input 
                type="text" 
                {...register('email')} 
                required 
                placeholder="Digite seu email ou usuário"
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
            isLoading={isPending}
          >
            Entrar
          </Button>
        </form>
      </Box>
    </Box>
  );
} 
