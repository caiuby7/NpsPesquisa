import { Box, Checkbox, VStack, Text } from "@chakra-ui/react";
import { UseFormRegister } from "react-hook-form";

import { QuestionResponse } from "@/app/services/form";
import { AnswersFormType } from "@/app/widgets/execution-question/use-execution-answer";

export default function MultipleChoiceQuestion({
  register,
  question,
  index
}: {
  register: UseFormRegister<AnswersFormType>;
  question: QuestionResponse;
  index: number;
}) {
  return (
    <Box p={2} borderRadius="md">
      <Text mb={4} fontWeight="bold" textAlign="left">{question.texto}</Text>
      <VStack align="stretch">
        {question?.opcoes?.map((field) => (
          <Checkbox.Root
            key={field.idOpcao}
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
