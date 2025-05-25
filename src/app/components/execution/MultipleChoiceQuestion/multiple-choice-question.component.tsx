import { Box, Checkbox, VStack } from "@chakra-ui/react";
import { Control, useFieldArray, UseFormRegister } from "react-hook-form";

import { FormSchemaType } from "@/app/features/create-question/useCreateQuestionForm";

export default function MultipleChoiceQuestion({
  register,
  control,
}: {
  register: UseFormRegister<FormSchemaType>;
  control: Control<FormSchemaType>;
}) {
  const { fields } = useFieldArray<FormSchemaType>({
    name: `options`,
    control,
  });

  return (
    <Box mt={4} p={2} borderWidth="1px" borderRadius="md">
      <VStack align="stretch">
        {fields.map((field, index) => (
          <Checkbox.Root
            key={field.idOpcao}
            {...register(`opcoes.${index}.idOpcao`)}
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Checkbox.Label>{field.texto}</Checkbox.Label>
          </Checkbox.Root>
        ))}
      </VStack>
    </Box>
  );
}
