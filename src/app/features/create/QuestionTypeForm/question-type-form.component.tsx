import {
  Box,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { UseFormRegister, Control, UseFormGetValues, UseFormSetValue, FieldErrors, } from "react-hook-form";
import MultipleChoiceQuestion from "../MultipleChoiceQuestion/multiple-choice-question.component";
import SortableFieldArray from "../ArrayQuestion/array-question.component";
import RatingLabelsEditorForm from "../LinearScale/linear-scale.component";
import { QuestionTypeEnum } from "@/app/services/question";
import { FormSchemaType } from "@/app/widgets/create-question/useCreateQuestionForm";

interface Props {
  type: QuestionTypeEnum;
  register: UseFormRegister<FormSchemaType>;
  control: Control<FormSchemaType>;
  getValues: UseFormGetValues<FormSchemaType>;
  setValue: UseFormSetValue<FormSchemaType>;
  errors: FieldErrors<FormSchemaType>
}

export function QuestionTypeForm({ type, register, control, getValues, setValue, errors }: Props) {
  if (type === QuestionTypeEnum.MULTIPLE_CHOICE || type === QuestionTypeEnum.MENU) {
    return (
      <Box>
        <Text>Opções:</Text>
        <MultipleChoiceQuestion register={register} control={control} isMultipleChoice={type === QuestionTypeEnum.MULTIPLE_CHOICE} errors={errors}/>
      </Box>
    );
  }

  if (type === QuestionTypeEnum.TEXT_BOX) {
    return <Textarea placeholder="Resposta do usuário" disabled/>;
  }

  if (type === QuestionTypeEnum.LINEAR_SCALE) {
    return (
      <RatingLabelsEditorForm control={control} register={register} errors={errors}/>
    );
  }

  if (type === QuestionTypeEnum.MATRIX) {
    return (
      <SortableFieldArray register={register} control={control} setValue={setValue} getValues={getValues} errors={errors} />
    );
  }

  return null;
}
