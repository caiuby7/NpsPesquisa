// pages/login.tsx
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import nookies from "nookies";
import { Box, Button, Input, Heading, Text, Stack } from "@chakra-ui/react";
import {
  LoginParams,
  LoginResponse,
  useLoginMutate,
} from "@/app/services/login";

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
    <Box maxW="md" mx="auto" mt={20} p={8} borderWidth={1} borderRadius="lg">
      <Heading mb={6}>Admin</Heading>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack mb={4}>
          <Text>Email</Text>
          <Input type="email" {...register("email")} required />
        </Stack>
        <Stack mb={6}>
          <Text>Senha</Text>
          <Input type="password" {...register("senha")} required />
        </Stack>
        <Button colorScheme="purple" type="submit" width="full" loading={isPending}>
          Entrar
        </Button>
      </form>
    </Box>
  );
}
