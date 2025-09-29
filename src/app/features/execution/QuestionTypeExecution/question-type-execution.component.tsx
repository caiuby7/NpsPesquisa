/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Text, Textarea } from "@chakra-ui/react";
import { UseFormRegister, Control, UseFormWatch } from "react-hook-form";
import MultipleChoiceQuestion from "../MultipleChoiceQuestion/multiple-choice-question.component";
import { MatrixQuestion } from "../ArrayQuestion/array-question.component";
import { EscalaLinear } from "../LinearScale/linear-scale.component";
import CheckboxExecution from "../CheckboxExecution/checkbox-execution.component";
import {
  QuestionResponse,
  QuestionType,
  QuestionTypeEnum,
} from "../../../services/form/form.services.types";
import MenuExecution from "../Menu/menu.component";

interface FormValues {
  [key: string]: string | number | boolean | string[] | number[];
}

interface Props {
  type: QuestionType;
  register: UseFormRegister<FormValues>;
  control: Control<FormValues>;
  question: QuestionResponse;
  index: number;
  disabled?: boolean;
  watch: UseFormWatch<FormValues>;
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
    const [opcaoA, opcaoB] = question.opcoes;
    const min = Math.min(Number(opcaoA.valor), Number(opcaoB.valor));
    const max = Math.max(Number(opcaoA.valor), Number(opcaoB.valor));
    const minLabel = Number(opcaoA.valor) < Number(opcaoB.valor) ? opcaoA.texto : opcaoB.texto;
    const maxLabel = Number(opcaoA.valor) > Number(opcaoB.valor) ? opcaoA.texto : opcaoB.texto;
    return (
      <EscalaLinear
        min={min}
        max={max}
        minLabel={minLabel}
        maxLabel={maxLabel}
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
        register={register} 
        index={index} 
      />
    );
  }

  if (type === "CaixaSelecao" && question?.opcoes) {
    return (
      <CheckboxExecution
        register={register}
        question={question}
        index={index}
      />
    );
  }

  return null;
}
