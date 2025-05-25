import { Box} from "@chakra-ui/react";
import { UseFormRegister, Control } from "react-hook-form";
import { CustomSelect } from "../Select/select.component";
import { FormSchemaType } from "@/app/features/create-question/useCreateQuestionForm";

export default function MenuExecution({
  control,
  register,
}: {
  register: UseFormRegister<FormSchemaType>;
  control: Control<FormSchemaType>;
}) {

  const options = Array.from({ length: 10 }, (_, i) => {
    return { label: i + 1, value: i + 1 };
  }); 

  return (
    <Box p={4} as="form">
      <CustomSelect
        control={control}
        register={register}
        items={options}
        name={`ratingLabels.min`}
      />
    </Box>
  );
}
