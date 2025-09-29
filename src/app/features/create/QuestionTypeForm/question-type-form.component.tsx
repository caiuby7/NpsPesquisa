import {
  Box,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { UseFormRegister, Control, UseFormGetValues, UseFormSetValue, FieldErrors } from "react-hook-form";
import MultipleChoiceQuestion from "../MultipleChoiceQuestion/multiple-choice-question.component";
import SortableFieldArray from "../ArrayQuestion/array-question.component";
import RatingLabelsEditorForm from "../LinearScale/linear-scale.component";
import CheckboxQuestion from "../CheckboxQuestion/checkbox-question.component";
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
  isCondicional?: boolean;
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

interface CheckboxProps extends BaseQuestionProps {
  type: QuestionTypeEnum.CHECKBOX;
}

export function QuestionTypeForm({ type, register, control, getValues, setValue, errors, isCondicional }: BaseQuestionProps) {
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
          isCondicional={isCondicional}
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
        register={register as any}
        control={control as any}
        setValue={setValue as any}
        getValues={getValues as any}
        errors={errors as any}
      />
    );
  }

  if (type === QuestionTypeEnum.CHECKBOX) {
    return (
      <Box>
        <Text>Opções de seleção (múltipla escolha):</Text>
        <CheckboxQuestion 
          register={register as UseFormRegister<FormSchemaType>}
          control={control as Control<FormSchemaType>}
          errors={errors as FieldErrors<FormSchemaType>}
          index={0}
          isCondicional={isCondicional}
        />
      </Box>
    );
  }

  return null;
}
