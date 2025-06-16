import { CustomSelect } from "../../../components/Select/select.component";
import { EscalaLinearSchema, FormSchemaType } from "../../../widgets/create-question/useCreateQuestionForm";
import { Box, FormControl, Flex, HStack, Input, Text, VStack } from "@chakra-ui/react";
import { useWatch, UseFormRegister, Control, FieldErrors } from "react-hook-form";

interface Props {
  register: UseFormRegister<EscalaLinearSchema>;
  control: Control<EscalaLinearSchema>;
  errors: FieldErrors<EscalaLinearSchema>;
  index: number;
}

export default function RatingLabelsEditorForm({
  register,
  control,
  errors,
  index,
}: Props) {
  const min = useWatch({
    control,
    name: `ratingLabels.min`,
  });

  const max = useWatch({
    control,
    name: `ratingLabels.max`,
  });

  const range = Array.from(
    { length: Number(max) - Number(min) + 1 },
    (_, i) => Number(min) + i
  );

  const minOptions = [
    { value: "0", label: "0" },
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5", label: "5" },
  ];

  const maxOptions = [
    { value: "5", label: "5" },
    { value: "6", label: "6" },
    { value: "7", label: "7" },
    { value: "8", label: "8" },
    { value: "9", label: "9" },
    { value: "10", label: "10" },
  ];

  return (
    <VStack spacing={4} align="stretch">
      <HStack>
        <FormControl isInvalid={!!errors?.ratingLabels?.min}>
          <Text mb={2}>Valor mínimo</Text>
          <CustomSelect
            items={minOptions}
            control={control}
            name="ratingLabels.min"
            placeholder="Selecione o valor mínimo"
          />
        </FormControl>

        <FormControl isInvalid={!!errors?.ratingLabels?.max}>
          <Text mb={2}>Valor máximo</Text>
          <CustomSelect
            items={maxOptions}
            control={control}
            name="ratingLabels.max"
            placeholder="Selecione o valor máximo"
          />
        </FormControl>
      </HStack>

      <FormControl isInvalid={!!errors?.ratingLabels?.minLabel}>
        <Text mb={2}>Rótulo do valor mínimo</Text>
        <Input
          placeholder="Ex: Discordo totalmente"
          {...register(`ratingLabels.minLabel`)}
        />
      </FormControl>

      <FormControl isInvalid={!!errors?.ratingLabels?.maxLabel}>
        <Text mb={2}>Rótulo do valor máximo</Text>
        <Input
          placeholder="Ex: Concordo totalmente"
          {...register(`ratingLabels.maxLabel`)}
        />
      </FormControl>

      <Box>
        <Text mb={2}>Visualização</Text>
        <Flex
          direction="column"
          align="center"
          justify="center"
          p={4}
          borderWidth="1px"
          borderRadius="md"
        >
          <Text mb={4} fontWeight="bold">
            Pergunta exemplo
          </Text>
          <HStack spacing={4} justify="center">
            {range.map((val) => (
              <Box key={val} textAlign="center">
                <Text fontSize="sm">{val}</Text>
              </Box>
            ))}
          </HStack>
        </Flex>
      </Box>
    </VStack>
  );
}
