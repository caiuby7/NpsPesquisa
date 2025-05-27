import { Box, Text } from "@chakra-ui/react";
import { UseFormRegister, Control } from "react-hook-form";
import { QuestionResponse } from "@/app/services/form";
import { FormSchemaType } from "@/app/widgets/execution-question/useCreateQuestionForm";
import { CustomSelect } from "@/app/components/Select/select.component";

export default function MenuExecution({
  control,
  register,
  question
}: {
  register: UseFormRegister<FormSchemaType>;
  control: Control<FormSchemaType>;
  question: QuestionResponse
}) {

  const options = question.opcoes?.map(option => {
    return { value: option.idOpcao, label: option.texto }
  })

  return (
    <Box p={4} as="form">
      <Text mb={4} fontWeight="bold" textAlign="left">
        Como você avalia os seguintes aspectos?
      </Text>
      <CustomSelect
        control={control}
        register={register}
        items={options}
        name={`ratingLabels.min`}
      />
    </Box>
  );
}
