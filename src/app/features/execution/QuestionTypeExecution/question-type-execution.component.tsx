import { Box, Text, Textarea } from "@chakra-ui/react";
import { UseFormRegister, Control } from "react-hook-form";
import MultipleChoiceQuestion from "../MultipleChoiceQuestion/multiple-choice-question.component";
import { MatrixQuestion } from "../ArrayQuestion/array-question.component";
import { EscalaLinear } from "../LinearScale/linear-scale.component";
import {
  QuestionResponse,
  QuestionType,
  QuestionTypeEnum,
} from "@/app/services/form";
import { AnswersFormType } from "@/app/widgets/execution-question/use-execution-answer";
import MenuExecution from "../Menu/menu.component";

interface Props {
  type: QuestionType;
  register: UseFormRegister<AnswersFormType>;
  control: Control<AnswersFormType>;
  question: QuestionResponse;
  index: number;
}

export function QuestionTypeExecution({
  type,
  register,
  control,
  question,
  index,
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

  if (type === QuestionTypeEnum.MENU) {
    return (
      <MenuExecution
        register={register}
        control={control}
        question={question}
        index={index}
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
        min={question.opcoes[0].ordem}
        max={question.opcoes[1].ordem}
        minLabel={question.opcoes[0].texto}
        maxLabel={question.opcoes[1].texto}
        onChange={console.log}
        index={index}
        register={register}
      />
    );
  }

  if (type === "Matriz" && question?.opcoes && question?.colunas) {
    return (
      <MatrixQuestion
        texto={question.texto}
        opcoes={question.opcoes}
        colunas={question.colunas}
        register={register}
        index={index}
      />
    );
  }

  return null;
}
