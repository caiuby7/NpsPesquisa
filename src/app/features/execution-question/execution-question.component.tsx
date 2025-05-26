import { Box, Button, Heading, Stack } from "@chakra-ui/react";
import { QuestionTypeForm } from "@/app/components/execution/QuestionTypeForm/question-type-form.component";
import { useGetForm } from "@/app/services/form/form.service.hooks";

import { useCreateQuestionForm } from "./useCreateQuestionForm";

export default function ExecutionQuestion() {
  const { data } = useGetForm({ id: "" })
  const { control, register, handleSubmit, setValue, getValues, watch } =
    useCreateQuestionForm();



  const type = watch("tipo");

  console.log(data)

  if(!data) return



  return (
    <Box p={8}>

      <Heading mb={6}>{data.titulo}</Heading>
      <form onSubmit={handleSubmit(console.log)}>
        <Stack>
          {data?.questoes.map((question, index) => (
            <Box key={question.tipo} borderWidth="1px" p={4} borderRadius="md">
              <Stack>
                <QuestionTypeForm
                  type={question.tipo}
                  register={register}
                  question={question}
                  control={control}
                />
              </Stack>
            </Box>
          ))}
        </Stack>

        <Button mt={8} colorScheme="blue" type="submit">
          Salvar formulário
        </Button>
      </form>
    </Box>
  );
}
