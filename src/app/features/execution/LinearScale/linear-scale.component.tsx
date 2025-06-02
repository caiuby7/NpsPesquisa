/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  Box,
  HStack,
  RadioGroup,
  Text,
} from '@chakra-ui/react';
import { UseFormRegister } from 'react-hook-form';

interface EscalaLinearProps {
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
  onChange: (value: string) => void;
  register: UseFormRegister<any>;
  index: number
  disabled?: boolean
  title: string
}

export const EscalaLinear: React.FC<EscalaLinearProps> = ({
  min,
  max,
  minLabel,
  maxLabel,
  register,
  index,
  disabled,
  title
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
        {title}
      </Text>
      <HStack justify="space-between" mb={2}>
        {range.map((val) => (
          <Text key={val} fontSize="sm" w="100%" textAlign="center">
            {val}
          </Text>
        ))}
      </HStack>



      <HStack justify="space-around" w="100%" >
        {range.map((val) => (
          <RadioGroup.Root key={val} w="100%" {...register(`${index}.resposta`)}>            
          <RadioGroup.Item disabled={disabled} value={val}>
            <RadioGroup.ItemHiddenInput />
            <RadioGroup.ItemIndicator />
          </RadioGroup.Item>
          </RadioGroup.Root>

        ))}
      </HStack>


      <HStack justify="space-between" mt={2}>
        <Text fontSize="sm">{minLabel}</Text>
        <Text fontSize="sm">{maxLabel}</Text>
      </HStack>
    </Box >
  );
};
