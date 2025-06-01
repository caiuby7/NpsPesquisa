import { CustomSelect } from "@/app/components/Select/select.component";
import { EscalaLinearSchema, FormSchemaType } from "@/app/widgets/create-question/useCreateQuestionForm";
import { Box, Field, Flex, HStack, Input, Text, VStack } from "@chakra-ui/react";
import { useWatch, UseFormRegister, Control, FieldErrors } from "react-hook-form";
import { QuestionTypeEnum } from "@/app/services/form";


export default function RatingLabelsEditorForm({
  control,
  register,
  errors
}: {
  register: UseFormRegister<FormSchemaType>;
  control: Control<FormSchemaType>;
  errors: FieldErrors<EscalaLinearSchema>;
}) {
  const minValue = useWatch({ control, name: `ratingLabels.min` });
  const maxValue = useWatch({ control, name: `ratingLabels.max` });
  const options = Array.from({ length: 11 }, (_, i) => {
    return { label: String(i), value: QuestionTypeEnum.LINEAR_SCALE };
  });

  return (
    <Box p={4} as="form">
      <HStack mb={4}>
        <CustomSelect
          control={control}
          invalid={errors?.ratingLabels && !!errors.ratingLabels.min}
          items={options}
          name={`ratingLabels.min`}
        />
        <Text>a</Text>
        <CustomSelect
          control={control}
          invalid={errors?.ratingLabels && !!errors.ratingLabels.max}
          items={options}
          name={`ratingLabels.max`}
        />
      </HStack>

      <VStack align="stretch" >
        <Flex align="center" gap={2}>
          <Text width="20px">{minValue}</Text>
          <Field.Root invalid={errors?.ratingLabels && !!errors.ratingLabels.minLabel}>
            <Input
              placeholder="Descrição para mínimo"
              {...register(`ratingLabels.minLabel`)}
            />
          </Field.Root>

        </Flex>

        <Flex align="center" gap={2}>
          <Text width="20px">{maxValue}</Text>
          <Field.Root invalid={errors?.ratingLabels && !!errors.ratingLabels.maxLabel}>
            <Input
              placeholder="Descrição para máximo"
              {...register(`ratingLabels.maxLabel`)}
            />
          </Field.Root>

        </Flex>
      </VStack>
    </Box>
  );
}
