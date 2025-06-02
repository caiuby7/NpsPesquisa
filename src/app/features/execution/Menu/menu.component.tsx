/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Text } from "@chakra-ui/react";
import { UseFormRegister, Control } from "react-hook-form";
import { QuestionResponse } from "@/app/services/form";
import { CustomSelect } from "@/app/components/Select/select.component";

export default function MenuExecution({
  control,
  register,
  question,
  index
}: {
  register: UseFormRegister<any>;
  control: Control;
  question: QuestionResponse
  index: number
}) {

  const options = question.opcoes?.map(option => {
    return { value: option.id, label: option.texto }
  })

  return (
    <Box as="form">
      <Text mb={4} fontWeight="bold" textAlign="left">
        {question.texto}
      </Text>
      <CustomSelect
        control={control}
        register={register}
        items={options}
        name={`${index}.resposta`}
      />
    </Box>
  );
}
