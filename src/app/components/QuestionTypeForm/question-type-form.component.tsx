/* eslint-disable @typescript-eslint/no-explicit-any */
// components/QuestionTypeForm.tsx
import {
    Box,
    Input,
    Text,
    Textarea,
  } from "@chakra-ui/react";
  import { UseFormRegister, Control } from "react-hook-form";
import MultipleChoiceQuestion from "../MultipleChoiceQuestion/multiple-choice-question.component";
  
  interface Props {
    type: string;
    index: number;
    register: UseFormRegister<any>;
    control: Control<any>;
  }
  
  export function QuestionTypeForm({ type, index, register, control }: Props) {
    if (type === "multiple_choice" || type === "dropdown" || type === "worst_best") {
      return (
        <Box>
          <Text>Opções:</Text>
          <MultipleChoiceQuestion register={register} control={control} element={index} />
        </Box>
      );
    }
  
    if (type === "text_box") {
      return <Textarea placeholder="Resposta do usuário"  />;
    }
  /*
    if (type === "slider") {
      return (
        <Box>
          <Text>Barra de Deslizar (exemplo):</Text>
          <Controller
            name={`questions.${index}.sliderValue`}
            control={control}
            defaultValue={50}
            render={({ field }) => (
              <Slider {...field} min={0} max={100}>
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            )}
          />
        </Box>
      );
    }
  */
    if (type === "matrix") {
      return (
        <Box>
          <Text fontSize="sm" color="gray.500">
            (Interface de matriz pode ser complexa — defina linhas e colunas)
          </Text>
          <Input
            placeholder="Ex: Satisfação x Qualidade"
            {...register(`questions.${index}.matrixDescription`)}
          />
        </Box>
      );
    }
  
    return null;
  }
  