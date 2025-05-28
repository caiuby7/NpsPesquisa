import React from 'react';
import {
  Box,
  HStack,
  RadioGroup,
  Text,
} from '@chakra-ui/react';
import { AnswersFormType } from '@/app/widgets/execution-question/use-execution-answer';
import { UseFormRegister } from 'react-hook-form';

interface EscalaLinearProps {
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
  onChange: (value: string) => void;
  register: UseFormRegister<AnswersFormType>;
  index: number
}

export const EscalaLinear: React.FC<EscalaLinearProps> = ({
  min,
  max,
  minLabel,
  maxLabel,
  register,
  index
}) => {
  const range = Array.from({ length: max - min + 1 }, (_, i) => String(min + i));

  return (
    <Box
      borderRadius="md"
      p={4}
      textAlign="center"
      w="100%"
    >
      <Text mb={4} fontWeight="bold" textAlign="left">
        Como você avalia os seguintes aspectos?
      </Text>
      <HStack justify="space-between" mb={2}>
        {range.map((val) => (
          <Text key={val} fontSize="sm" w="100%" textAlign="center">
            {val}
          </Text>
        ))}
      </HStack>


      <RadioGroup.Root w="100%" >
        <HStack justify="space-around" w="100%">
          {range.map((val) => (
            <RadioGroup.Item key={val} value={val} {...register(`${index}.resposta`)}>
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemIndicator />
            </RadioGroup.Item>
          ))}
        </HStack>
      </RadioGroup.Root>

      <HStack justify="space-between" mt={2}>
        <Text fontSize="sm">{minLabel}</Text>
        <Text fontSize="sm">{maxLabel}</Text>
      </HStack>
    </Box>
  );
};
