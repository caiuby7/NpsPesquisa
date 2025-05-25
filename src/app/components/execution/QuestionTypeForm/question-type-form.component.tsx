import {
  Box,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { UseFormRegister, Control, UseFormGetValues, UseFormSetValue, } from "react-hook-form";
import MultipleChoiceQuestion from "../MultipleChoiceQuestion/multiple-choice-question.component";
import SortableFieldArray from "../ArrayQuestion/array-question.component";
import RatingLabelsEditorForm from "../LinearScale/linear-scale.component";
import { QuestionType, QuestionTypeEnum } from "@/app/services/question";
import { FormSchemaType } from "@/app/features/create-question/useCreateQuestionForm";

interface Props {
  type: QuestionType;
  register: UseFormRegister<FormSchemaType>;
  control: Control<FormSchemaType>;
  getValues: UseFormGetValues<FormSchemaType>;
  setValue: UseFormSetValue<FormSchemaType>;
}

export function QuestionTypeForm({ type, register, control, getValues, setValue }: Props) {
  if (type === QuestionTypeEnum.MULTIPLE_CHOICE || type === QuestionTypeEnum.MENU) {
    return (
      <Box>
        <Text>Opções:</Text>
        <MultipleChoiceQuestion register={register} control={control} isMultipleChoice={type === QuestionTypeEnum.MULTIPLE_CHOICE}/>
      </Box>
    );
  }

  if (type === "CaixaTexto") {
    return <Textarea placeholder="Resposta do usuário" />;
  }

  if (type === "EscalaLinear") {
    return (
      <RatingLabelsEditorForm control={control} register={register} />
    );
  }

  if (type === "Matriz") {
    return (
      <SortableFieldArray register={register} control={control} setValue={setValue} getValues={getValues} />
    );
  }

  return null;
}
