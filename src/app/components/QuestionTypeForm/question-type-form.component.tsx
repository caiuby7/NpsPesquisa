/* eslint-disable @typescript-eslint/no-explicit-any */
// components/QuestionTypeForm.tsx
import {
    Box,
    Input,
    Text,
    Textarea,

    Stack,
    Button,
  } from "@chakra-ui/react";
  import { UseFormRegister, Control, useFieldArray } from "react-hook-form";
  
  interface Props {
    type: string;
    index: number;
    register: UseFormRegister<any>;
    control: Control<any>;
  }
  
  export function QuestionTypeForm({ type, index, register, control }: Props) {
    const { fields, append, remove } = useFieldArray({
      name: `questions.${index}.options`,
      control,
    });
  
    if (type === "multiple_choice" || type === "dropdown" || type === "worst_best") {
      return (
        <Box>
          <Text>Opções:</Text>
          <Stack>
            {fields.map((field, optIdx) => (
              <Stack key={field.id} direction="row">
                <Input
                  placeholder={`Opção ${optIdx + 1}`}
                  {...register(`questions.${index}.options.${optIdx}.label`)}
                />
                <Button colorScheme="red" onClick={() => remove(optIdx)}>
                  Remover
                </Button>
              </Stack>
            ))}
          </Stack>
          <Button mt={2} onClick={() => append({ label: "" })}>
            Adicionar opção
          </Button>
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
  