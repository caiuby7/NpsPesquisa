import { Box, Text } from "@chakra-ui/react";
import { UseFormRegister, Control } from "react-hook-form";
import { QuestionResponse } from "@/app/services/form";
import { AnswersFormType } from "@/app/widgets/execution-question/use-execution-answer";
import { CustomSelect } from "@/app/components/Select/select.component";

export default function MenuExecution({
  control,
  register,
  question,
  index
}: {
  register: UseFormRegister<AnswersFormType>;
  control: Control<AnswersFormType>;
  question: QuestionResponse
  index: number
}) {

  const options = question.opcoes?.map(option => {
    return { value: option.idOpcao, label: option.texto }
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
