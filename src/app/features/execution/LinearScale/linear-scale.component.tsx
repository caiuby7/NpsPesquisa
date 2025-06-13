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
      <Box w="100%">
        <HStack w="100%" alignItems="center" gap={0}>
          <Box minW="0" pr={2} textAlign="right" display="flex" alignItems="center" justifyContent="flex-end">
            <Text fontSize="sm" whiteSpace="nowrap">{minLabel}</Text>
          </Box>
          <Box w="100%">
            <HStack w="100%" gap={0} justify="center">
              {range.map((val) => (
                <Box key={val} w="32px" textAlign="center">
                  <Text fontSize="sm">{val}</Text>
                </Box>
              ))}
            </HStack>
            <HStack w="100%" gap={0} justify="center" mt={1}>
              {range.map((val) => (
                <Box key={val} w="32px" textAlign="center" display="flex" alignItems="center" justifyContent="center">
                  <RadioGroup.Root>
                    <RadioGroup.Item disabled={disabled} value={val} m="auto" {...register(`${index}.resposta`)}>
                      <RadioGroup.ItemHiddenInput />
                      <RadioGroup.ItemIndicator />
                    </RadioGroup.Item>
                  </RadioGroup.Root>
                </Box>
              ))}
            </HStack>
          </Box>
          <Box minW="0" pl={2} textAlign="left" display="flex" alignItems="center" justifyContent="flex-start">
            <Text fontSize="sm" whiteSpace="nowrap">{maxLabel}</Text>
          </Box>
        </HStack>
      </Box>
    </Box >
  );
};
