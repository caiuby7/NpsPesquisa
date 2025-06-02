/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Checkbox, VStack, Text } from "@chakra-ui/react";
import { UseFormRegister } from "react-hook-form";

import { QuestionResponse } from "@/app/services/form";

export default function MultipleChoiceQuestion({
  register,
  question,
  index
}: {
  register: UseFormRegister<any>;
  question: QuestionResponse;
  index: number;
}) {
  return (
    <Box p={2} borderRadius="md">
      <Text mb={4} fontWeight="bold" textAlign="left">{question.texto}</Text>
      <VStack align="stretch">
        {question?.opcoes?.map((field) => (
          <Checkbox.Root
            value={field.id}
            key={field.id}
            {...register(`${index}.resposta`)}
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
