import React from 'react';
import {
  Box,
  HStack,
  RadioGroup,
  Text,
} from '@chakra-ui/react';


interface EscalaLinearProps {
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
  value: string;
  onChange: (value: string) => void;
}

export const EscalaLinear: React.FC<EscalaLinearProps> = ({
  min,
  max,
  minLabel,
  maxLabel,
  value,
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


      <RadioGroup.Root value={value} w="100%">
        <HStack justify="space-around" w="100%">
          {range.map((val) => (
            <RadioGroup.Item key={val} value={val}>
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
