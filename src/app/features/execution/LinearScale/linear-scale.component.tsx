/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  Box,
  HStack,
  Radio,
  RadioGroup,
  Text,
  VStack
} from '@chakra-ui/react';
import { UseFormRegister } from 'react-hook-form';

interface Props {
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
  title: string;
  onChange: (value: string) => void;
  index: number;
  register: UseFormRegister<any>;
  disabled?: boolean;
}

export function EscalaLinear({
  min,
  max,
  minLabel,
  maxLabel,
  title,
  onChange,
  index,
  register,
  disabled,
}: Props) {
  const range = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <VStack align="stretch" spacing={4}>
      <Text fontWeight="bold">{title}</Text>
      <HStack justify="space-between" align="center">
        <Text fontSize="sm" color="gray.600">
          {minLabel}
        </Text>
        <Box>
          <HStack spacing={2} justify="center">
            {range.map((val) => (
              <Box key={val} w="32px" textAlign="center" display="flex" alignItems="center" justifyContent="center">
                <RadioGroup
                  onChange={(value) => onChange(value)}
                  value={String(val)}
                >
                  <Radio
                    disabled={disabled}
                    value={String(val)}
                    m="auto"
                    {...register(`${index}.resposta`)}
                  />
                </RadioGroup>
              </Box>
            ))}
          </HStack>
          <HStack spacing={2} justify="center" mt={2}>
            {range.map((val) => (
              <Box key={val} w="32px" textAlign="center">
                <Text fontSize="xs" color="gray.600">{val}</Text>
              </Box>
            ))}
          </HStack>
        </Box>
        <Text fontSize="sm" color="gray.600">
          {maxLabel}
        </Text>
      </HStack>
    </VStack>
  );
}
