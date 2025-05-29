import { Box, Button, Heading, Stack } from "@chakra-ui/react";
import { useGetForm } from "@/app/services/form/form.service.hooks";

import { QuestionTypeExecution } from "@/app/features/execution/QuestionTypeExecution/question-type-execution.component";
import { useExecutionAnswer } from "./use-execution-answer";

export default function ExecutionForm() {
  const { data } = useGetForm({ id: "1" });
  const { control, register, handleSubmit } =
    useExecutionAnswer();

  if (!data) return;

  return (
    <Box maxW="720px" m="auto" display="flex" flexDirection="column">
      <Heading mb={8}>{data.titulo}</Heading>
      <form onSubmit={handleSubmit(console.log)}>
        <Stack>
          {data?.questoesQuestionarios.map((question, index) => (
            <Box key={question.tipo} borderWidth="1px" p={4} borderRadius="md">
              <Stack>
                <QuestionTypeExecution
                  type={question.tipo}
                  register={register}
                  question={question}
                  control={control}
                  index={index}
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
