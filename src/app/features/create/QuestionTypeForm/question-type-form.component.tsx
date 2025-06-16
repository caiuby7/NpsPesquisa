import {
  Box,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { UseFormRegister, Control, UseFormGetValues, UseFormSetValue, FieldErrors } from "react-hook-form";
import MultipleChoiceQuestion from "../MultipleChoiceQuestion/multiple-choice-question.component";
import SortableFieldArray from "../ArrayQuestion/array-question.component";
import RatingLabelsEditorForm from "../LinearScale/linear-scale.component";
import { QuestionTypeEnum } from "../../../services/question";
import { 
  FormSchemaType, 
  MultipleChoiceSchemaType, 
  MatrixSchemaType,
  EscalaLinearSchema 
} from "../../../widgets/create-question/useCreateQuestionForm";

interface BaseQuestionProps {
  type: QuestionTypeEnum;
  register: UseFormRegister<FormSchemaType>;
  control: Control<FormSchemaType>;
  getValues: UseFormGetValues<FormSchemaType>;
  setValue: UseFormSetValue<FormSchemaType>;
  errors: FieldErrors<FormSchemaType>;
}

interface MultipleChoiceProps extends BaseQuestionProps {
  type: QuestionTypeEnum.MULTIPLE_CHOICE | QuestionTypeEnum.MENU;
}

interface MatrixProps extends BaseQuestionProps {
  type: QuestionTypeEnum.MATRIX;
}

interface LinearScaleProps extends BaseQuestionProps {
  type: QuestionTypeEnum.LINEAR_SCALE;
}

interface TextBoxProps extends BaseQuestionProps {
  type: QuestionTypeEnum.TEXT_BOX;
}

export function QuestionTypeForm({ type, register, control, getValues, setValue, errors }: BaseQuestionProps) {
  if (type === QuestionTypeEnum.MULTIPLE_CHOICE || type === QuestionTypeEnum.MENU) {
    return (
      <Box>
        <Text>Opções:</Text>
        <MultipleChoiceQuestion 
          register={register as UseFormRegister<MultipleChoiceSchemaType>}
          control={control as Control<MultipleChoiceSchemaType>}
          isMultipleChoice={type === QuestionTypeEnum.MULTIPLE_CHOICE}
          errors={errors as FieldErrors<MultipleChoiceSchemaType>}
          index={0}
        />
      </Box>
    );
  }

  if (type === QuestionTypeEnum.TEXT_BOX) {
    return <Textarea placeholder="Resposta do usuário" disabled/>;
  }

  if (type === QuestionTypeEnum.LINEAR_SCALE) {
    return (
      <RatingLabelsEditorForm 
        control={control as Control<EscalaLinearSchema>}
        register={register as UseFormRegister<EscalaLinearSchema>}
        errors={errors as FieldErrors<EscalaLinearSchema>}
        index={0}
      />
    );
  }

  if (type === QuestionTypeEnum.MATRIX) {
    return (
      <SortableFieldArray 
        register={register as UseFormRegister<MatrixSchemaType>}
        control={control as Control<MatrixSchemaType>}
        setValue={setValue as UseFormSetValue<MatrixSchemaType>}
        getValues={getValues as UseFormGetValues<MatrixSchemaType>}
        errors={errors as FieldErrors<MatrixSchemaType>}
      />
    );
  }

  return null;
}
