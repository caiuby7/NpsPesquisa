/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  Box,
  HStack,
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
  value?: string | number;
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
  value,
}: Props) {
  const range = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <VStack align="stretch" spacing={4}>
      <Text fontWeight="bold" mb={4}>{title}</Text>
      <Box position="relative" w="100%">
        <HStack justify="space-between" w="100%" mb={1}>
          <Text fontSize="sm" color="gray.600" fontWeight="semibold">
            {minLabel}
          </Text>
          <Text fontSize="sm" color="gray.600" fontWeight="semibold">
            {maxLabel}
          </Text>
        </HStack>
        <HStack justify="center" align="center">
          {range.map((val) => (
            <Box
              key={val}
              w="60px"
              textAlign="center"
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              <input
                type="radio"
                disabled={disabled}
                value={String(val)}
                name={`escala-linear-${index}`}
                checked={String(value) === String(val)}
                onChange={() => onChange(String(val))}
                style={{ margin: '0 auto', width: '20px', height: '20px', accentColor: '#805ad5' }}
              />
              <Text fontSize="sm" color="gray.600" mt={2}>{val}</Text>
            </Box>
          ))}
        </HStack>
      </Box>
    </VStack>
  );
}
