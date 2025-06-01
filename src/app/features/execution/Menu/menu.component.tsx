import { Box } from "@chakra-ui/react";
import { QuestionResponse } from "@/app/services/form";
import { CustomSelect } from "@/app/components/Select/select.component";
import { useFormContext } from "react-hook-form";

export const Menu = ({ question }: { question: QuestionResponse }) => {
  const { control } = useFormContext();
  const options = question.opcoes?.map(option => {
    return { value: option.id, label: option.texto }
  }) || [];

  return (
    <Box>
      <CustomSelect
        control={control}
        items={options}
        name={String(question.id)}
      />
    </Box>
  );
};
