import { Box, Checkbox, VStack, Text } from "@chakra-ui/react";
import { Control, useFieldArray, UseFormRegister } from "react-hook-form";

import { FormSchemaType } from "@/app/features/create-question/useCreateQuestionForm";
import { QuestionResponse } from "@/app/services/form";

export default function MultipleChoiceQuestion({
  register,
  control,
  question
}: {
  register: UseFormRegister<FormSchemaType>;
  control: Control<FormSchemaType>;
  question: QuestionResponse
}) {
  console.log(question)
  return (
    <Box p={2} borderRadius="md">
      <Text mb={4} fontWeight="bold" textAlign="left">{question.texto}</Text>
      <VStack align="stretch">
        {question?.opcoes?.map((field, index) => (
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
