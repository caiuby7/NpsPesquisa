/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Checkbox, Text, VStack } from "@chakra-ui/react";
import { UseFormRegister } from "react-hook-form";
import { QuestionResponse } from "../../../services/form/form.services.types";

interface Props {
  register: UseFormRegister<any>;
  question: QuestionResponse;
  index: number;
}

export default function CheckboxExecution({
  register,
  question,
  index,
}: Props) {
  return (
    <Box>
      <Text mb={4} fontWeight="bold" textAlign="left">{question.texto}</Text>
      <VStack align="stretch">
        {question?.opcoes?.map((field) => (
          <Checkbox
            key={field.id}
            value={String(field.id)}
            {...register(`${index}.resposta`)}
          >
            {field.texto}
          </Checkbox>
        ))}
      </VStack>
    </Box>
  );
}
