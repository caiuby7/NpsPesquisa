/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Text, Textarea } from "@chakra-ui/react";
import { UseFormRegister } from "react-hook-form";
import MultipleChoiceQuestion from "../MultipleChoiceQuestion/multiple-choice-question.component";
import { MatrixQuestion } from "../ArrayQuestion/array-question.component";
import { EscalaLinear } from "../LinearScale/linear-scale.component";
import {
  QuestionResponse,
  QuestionType,
  QuestionTypeEnum,
} from "@/app/services/form";
import { AnswersFormType } from "@/app/widgets/execution-question/use-execution-answer";
import { Menu as MenuExecution } from "../Menu/menu.component";

interface Props {
  type: QuestionType;
  register: UseFormRegister<AnswersFormType>;
  question: QuestionResponse;
  index: number;
  disabled?: boolean;
}

export function QuestionTypeExecution({
  type,
  register,
  question,
  index,
  disabled,
}: Props) {
  if (type === QuestionTypeEnum.MULTIPLE_CHOICE) {
    return (
      <MultipleChoiceQuestion
        register={register}
        question={question}
        index={index}
      />
    );
  }

  if (type === QuestionTypeEnum.MENU && question?.opcoes) {
    return (
      <MenuExecution
        question={question}
      />
    );
  }

  if (type === "CaixaTexto") {
    return (
      <Box>
        <Text mb={4} fontWeight="bold" textAlign="left">
          {question.texto}
        </Text>
        <Textarea
          placeholder="Resposta do usuário"
          {...register(`${index}.resposta`)}
        />
      </Box>
    );
    return;
  }

  if (type === "EscalaLinear" && question?.opcoes) {
    return (
      <EscalaLinear
        min={Number(question.opcoes[0].valor)}
        max={Number(question.opcoes[1].valor)}
        minLabel={question.opcoes[0].texto}
        maxLabel={question.opcoes[1].texto}
        title={question.texto}
        onChange={console.log}
        index={index}
        register={register}
        disabled={disabled}
      />
    );
  }

  if (type === "Matriz") {
    const opcoes = question.opcoes || [];
    const colunas = question.colunas || [];
    
    console.log('QuestionTypeExecution - Matrix data:', { question, opcoes, colunas });
    
    return (
      <MatrixQuestion
        texto={question.texto}
        opcoes={opcoes}
        colunas={colunas}
      />
    );
  }

  return null;
}
