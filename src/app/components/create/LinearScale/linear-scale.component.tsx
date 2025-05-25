import { Box, Flex, HStack, Input, Text, VStack } from "@chakra-ui/react";
import { useWatch, UseFormRegister, Control } from "react-hook-form";
import { CustomSelect } from "../Select/select.component";
import { FormSchemaType } from "@/app/features/create-question/useCreateQuestionForm";

export default function RatingLabelsEditorForm({
  control,
  register,
}: {
  register: UseFormRegister<FormSchemaType>;
  control: Control<FormSchemaType>;
}) {
  const minValue = useWatch({ control, name: `ratingLabels.min` });
  const maxValue = useWatch({ control, name: `ratingLabels.max` });
  const options = Array.from({ length: 10 }, (_, i) => {
    return { label: i + 1, value: i + 1 };
  }); // 0 a 10

  return (
    <Box p={4} as="form">
      <HStack spacing={4} mb={4}>
        <CustomSelect
          control={control}
          register={register}
          items={options}
          name={`ratingLabels.min`}
        />
        <Text>a</Text>
        <CustomSelect
          control={control}
          register={register}
          items={options}
          name={`ratingLabels.max`}
        />
      </HStack>

      <VStack align="stretch" spacing={4}>
        <Flex align="center" gap={2}>
          <Text width="20px">{minValue}</Text>
          <Input
            placeholder="Descrição para mínimo"
            {...register(`ratingLabels.minLabel`)}
          />
        </Flex>

        <Flex align="center" gap={2}>
          <Text width="20px">{maxValue}</Text>
          <Input
            placeholder="Descrição para máximo"
            {...register(`ratingLabels.maxLabel`)}
          />
        </Flex>
      </VStack>
    </Box>
  );
}
