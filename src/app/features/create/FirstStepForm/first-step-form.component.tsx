import { Box, Button, Field, Heading, Input, VStack } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { firstStepFormSchema, FirstStepFormValues } from "./validationSchema";

export const FirstStepForm = ({ onSubmit }: { onSubmit: (data: FirstStepFormValues) => void }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FirstStepFormValues>({
    resolver: zodResolver(firstStepFormSchema),
  });

  return (
    <Box>
      <Heading as="h2" size="lg" mb={6}>
        Criar novo formulário
      </Heading>

      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack align="stretch">
          <Field.Root invalid={!!errors.titulo}>
            <Field.Label>Nome do formulário</Field.Label>
            <Input placeholder="Digite o titulo" {...register("titulo")} />
            <Field.ErrorText>{errors.titulo?.message}</Field.ErrorText>
          </Field.Root>

            <Field.Root invalid={!!errors.descricao}>
            <Field.Label>Descrição do formualário</Field.Label>
            <Input placeholder="Digite o descrição" {...register("descricao")} />
            <Field.ErrorText>{errors.descricao?.message}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.dataExpiracao}>
            <Field.Label>Data de expiração</Field.Label>
            <Input type="date" {...register("dataExpiracao")} />
            <Field.ErrorText>{errors.dataExpiracao?.message}</Field.ErrorText>
          </Field.Root>

          <Button
            type="submit"
            colorScheme="teal"
            alignSelf="flex-end"
          >
            Próximo
          </Button>
        </VStack>
      </form>
    </Box>
  );
};
