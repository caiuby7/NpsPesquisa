/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Text, Textarea } from "@chakra-ui/react";
import { UseFormRegister, Control, UseFormWatch } from "react-hook-form";
import MultipleChoiceQuestion from "../MultipleChoiceQuestion/multiple-choice-question.component";
import { MatrixQuestion } from "../ArrayQuestion/array-question.component";
import { EscalaLinear } from "../LinearScale/linear-scale.component";
import {
  QuestionResponse,
  QuestionType,
  QuestionTypeEnum,
} from "@/app/services/form";
import MenuExecution from "../Menu/menu.component";

interface Props {
  type: QuestionType;
  register: UseFormRegister<any>;
  control: Control;
  question: QuestionResponse;
  index: number;
  disabled?: boolean;
  watch: UseFormWatch<any>

}

export function QuestionTypeExecution({
  type,
  register,
  question,
  index,
  disabled,
  watch,
  control
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
        question={question} control={control} index={index} />
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

  if (type === "Matriz" && question.opcoes && question.colunas) {

    return (
      <MatrixQuestion
        texto={question.texto}
        opcoes={question.opcoes}
        colunas={question.colunas}
        watch={watch}
        register={register} index={index} />
    );
  }

  return null;
}
