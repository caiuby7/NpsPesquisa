import { Box, Button, Heading, Stack } from "@chakra-ui/react";
import { useGetForm } from "@/app/services/form/form.service.hooks";

import { QuestionTypeExecution } from "@/app/features/execution/QuestionTypeExecution/question-type-execution.component";
import { RespostaMap, useExecutionAnswer } from "./use-execution-answer";
import { Answer, useAnswerMutate } from "@/app/services/answer";

export default function ExecutionForm() {
  const { data } = useGetForm({ id: "1" });
  const { mutate } = useAnswerMutate(console.log, console.log);
  const { control, register, handleSubmit, watch } = useExecutionAnswer();

  if (!data) return;

  function transformarRespostas(input: RespostaMap): Answer[] {
    const respostasQuestoes: Answer[] = [];

    for (const key in input) {
      const questaoId = Number(key);
      const resposta = input[key].resposta;

      if (typeof resposta === "string") {
        respostasQuestoes.push({ questaoId, valor: resposta });
      } else if (Array.isArray(resposta)) {
        resposta
          .filter((v): v is string => typeof v === "string")
          .forEach((opcaoId) => {
            respostasQuestoes.push({ questaoId, opcaoId });
          });
      }
    }

    return respostasQuestoes;
  }

  const onSubmit = (data: RespostaMap) => {
    const respostasQuestoes = transformarRespostas(data);

    mutate({
      questionarioId: 0,
      alunoId: 0,
      respostasQuestoes,
    });
  };

  return (
    <Box maxW={{ base: "100%", md: "80%" }} m="auto" display="flex" flexDirection="column">
      <Heading mb={8}>{data.titulo}</Heading>
      <form onSubmit={handleSubmit(onSubmit, console.log)}>
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
                  watch={watch}
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
