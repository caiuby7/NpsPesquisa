import { CustomSelect } from "@/app/components/Select/select.component";
import { FormSchemaType } from "@/app/widgets/create-question/useCreateQuestionForm";
import { Box, Flex, HStack, Input, Text, VStack } from "@chakra-ui/react";
import { useWatch, UseFormRegister, Control } from "react-hook-form";


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
      <HStack  mb={4}>
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

      <VStack align="stretch" >
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
