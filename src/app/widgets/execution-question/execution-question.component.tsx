import { Box, Button, Heading, Stack } from "@chakra-ui/react";
import { useGetForm } from "@/app/services/form/form.service.hooks";

import { useCreateQuestionForm } from "./useCreateQuestionForm";
import { QuestionTypeExecution } from "@/app/features/execution/QuestionTypeExecution/question-type-execution.component";

export default function CreateForm() {
  const { data } = useGetForm({ id: "" });
  const { control, register, handleSubmit, setValue, getValues, watch } =
    useCreateQuestionForm();

  if (!data) return;

  return (
    <Box maxW="720px" m="auto" display="flex" flexDirection="column">
      <Heading mb={8}>{data.titulo}</Heading>
      <form onSubmit={handleSubmit(console.log)}>
        <Stack>
          {data?.questoes.map((question, index) => (
            <Box key={question.tipo} borderWidth="1px" p={4} borderRadius="md">
              <Stack>
                <QuestionTypeExecution
                  type={question.tipo}
                  register={register}
                  question={question}
                  control={control}
                  setValue={setValue}
                  getValues={getValues}
                />
              </Stack>
            </Box>
          ))}
        </Stack>

        <Button mt={8} colorScheme="blue" type="submit">
          Enviar formulário
        </Button>
      </form>
    </Box>
  );
}
