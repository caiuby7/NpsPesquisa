import { Box, Button, Heading, Input, VStack, Checkbox } from "@chakra-ui/react";
import { FirstStepFormValues } from "./validationSchema";

export const FirstStepForm = ({
  onSubmit,
  register,
  handleSubmit,
  errors
}: {
  onSubmit: (data: FirstStepFormValues) => void,
  register: any,
  handleSubmit: any,
  errors: any
}) => {
  return (
    <Box>
      <Heading as="h2" size="lg" mb={6}>
        Criar novo formulário
      </Heading>

      <form onSubmit={handleSubmit((data: FirstStepFormValues) => {
        onSubmit(data);
      })}>
        <VStack align="stretch">
          <Box mb={2}>
            <label htmlFor="titulo">Nome do formulário</label>
            <Input id="titulo" placeholder="Digite o titulo" {...register("titulo")}/>
            {errors.titulo && (
              <Box color="red.500" fontSize="sm">{errors.titulo.message}</Box>
            )}
          </Box>

          <Box mb={2}>
            <label htmlFor="descricao">Descrição do formulário</label>
            <Input id="descricao" placeholder="Digite a descrição" {...register("descricao")}/>
            {errors.descricao && (
              <Box color="red.500" fontSize="sm">{errors.descricao.message}</Box>
            )}
          </Box>

          <Box mb={2}>
            <label htmlFor="dataInicio">Data de início</label>
            <Input id="dataInicio" type="date" {...register("dataInicio", { required: true })}/>
            {errors.dataInicio && (
              <Box color="red.500" fontSize="sm">{errors.dataInicio.message}</Box>
            )}
          </Box>

          <Box mb={2}>
            <label htmlFor="dataFim">Data de fim</label>
            <Input id="dataFim" type="date" {...register("dataFim", { required: true })}/>
            {errors.dataFim && (
              <Box color="red.500" fontSize="sm">{errors.dataFim.message}</Box>
            )}
          </Box>

          <Box mb={4}>
            <Checkbox.Root {...register("ordemAleatoria")}> 
              <Checkbox.HiddenInput />
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              <Checkbox.Label>Ordem Aleatória</Checkbox.Label>
            </Checkbox.Root>
          </Box>

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
