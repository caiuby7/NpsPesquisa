import { Box, Checkbox, VStack, Text } from "@chakra-ui/react";
import { Control, UseFormRegister } from "react-hook-form";

import { QuestionResponse } from "@/app/services/form";
import { FormSchemaType } from "@/app/widgets/execution-question/useCreateQuestionForm";

export default function MultipleChoiceQuestion({
  register,
  question
}: {
  register: UseFormRegister<FormSchemaType>;
  control: Control<FormSchemaType>;
  question: QuestionResponse
}) {
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
