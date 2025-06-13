import { Box, Button, Heading, Stack } from "@chakra-ui/react";
import { useGetForm } from "@/app/services/form/form.service.hooks";
import { QuestionTypeExecution } from "@/app/features/execution/QuestionTypeExecution/question-type-execution.component";
import { RespostaMap, useExecutionAnswer } from "./use-execution-answer";
import { Answer } from "@/app/services/answer";
import { useRouter } from "next/router";
import { api } from "@/app/services/api";

interface ExecutionFormProps {
  questionarioId?: number;
  alunoId?: number;
  chave?: string;
}

export default function ExecutionForm({ questionarioId, alunoId, chave }: ExecutionFormProps) {
  const router = useRouter();
  const { data } = useGetForm({ id: questionarioId?.toString() || "" });
  const { control, register, handleSubmit, watch } = useExecutionAnswer();

  if (!data) return null;

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

  const onSubmit = async (payload: RespostaMap) => {
    const respostasQuestoes = transformarRespostas(payload);

    try {
      if (chave) {
        await api.post(`/Questionario/responder/${chave}`, {
          questionarioId: data.id,
          alunoId: alunoId || 0,
          respostasQuestoes,
        });
      } else {
        await api.post("/Resposta", {
          questionarioId: data.id,
          alunoId: alunoId || 0,
          respostasQuestoes,
        });
      }

      alert("Respostas enviadas com sucesso!");
      router.push("/formularios");
    } catch (error) {
      alert("Erro ao enviar respostas. Tente novamente mais tarde.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap={8}>
        <Heading size="md">{data.titulo}</Heading>
        <Box>{data.descricao}</Box>
        {data.questoesQuestionarios.map((questao) => (
          <QuestionTypeExecution
            key={questao.id}
            type={questao.questao.tipo}
            question={questao.questao}
            register={register}
            control={control}
            index={questao.id}
            watch={watch}
          />
        ))}
        <Button type="submit" colorScheme="blue">
          Enviar Respostas
        </Button>
      </Stack>
    </form>
  );
}
