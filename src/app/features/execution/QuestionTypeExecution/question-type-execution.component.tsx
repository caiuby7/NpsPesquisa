import { Box, Text, Textarea } from "@chakra-ui/react";
import {
  UseFormRegister,
  Control,
  UseFormGetValues,
  UseFormSetValue,
} from "react-hook-form";
import MultipleChoiceQuestion from "../MultipleChoiceQuestion/multiple-choice-question.component";
import { MatrixQuestion } from "../ArrayQuestion/array-question.component";
import { EscalaLinear } from "../LinearScale/linear-scale.component";
import {
  QuestionResponse,
  QuestionType,
  QuestionTypeEnum,
} from "@/app/services/form";
import { FormSchemaType } from "@/app/widgets/execution-question/useCreateQuestionForm";
import MenuExecution from "../Menu/menu.component";

interface Props {
  type: QuestionType;
  register: UseFormRegister<FormSchemaType>;
  control: Control<FormSchemaType>;
  getValues: UseFormGetValues<FormSchemaType>;
  setValue: UseFormSetValue<FormSchemaType>;
  question: QuestionResponse;
}

export function QuestionTypeExecution({
  type,
  register,
  control,
  question,
}: Props) {
  if (
    type === QuestionTypeEnum.MULTIPLE_CHOICE
  ) {
    return (
      <MultipleChoiceQuestion
        register={register}
        control={control}
        question={question}
      />
    );
  }

  if (
    type === QuestionTypeEnum.MENU
  ) {
    return (
      <MenuExecution
        register={register}
        control={control}
        question={question}
      />
    );
  }

  if (type === "CaixaTexto") {
    return (
      <Box>
        <Text mb={4} fontWeight="bold" textAlign="left">{question.texto}</Text>
        <Textarea placeholder="Resposta do usuário" />
      </Box>
    );
    return;
  }

  if (type === "EscalaLinear" && question?.opcoes) {
    return (
      <EscalaLinear
        min={question.opcoes[0].ordem}
        max={question.opcoes[1].ordem}
        minLabel={question.opcoes[0].texto}
        maxLabel={question.opcoes[1].texto}
        value={""}
        onChange={console.log}
      />
    );
  }

  if (type === "Matriz" && question?.opcoes && question?.colunas) {
    return (
      <MatrixQuestion
        texto={question.texto}
        opcoes={question.opcoes}
        colunas={question.colunas}
      />
    );
  }

  return null;
}
