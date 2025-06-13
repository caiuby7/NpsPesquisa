/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  Text,
  HStack,
  VStack,
  RadioGroup,
} from "@chakra-ui/react";
import { UseFormRegister, UseFormWatch } from "react-hook-form";

interface Option {
  id: string | number;
  texto: string;
  ordem: number;
  peso: number;
}

interface MatrixQuestionProps {
  texto: string;
  opcoes: Option[];
  colunas: Option[];
  index: number;
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>
}

export const MatrixQuestion: React.FC<MatrixQuestionProps> = ({
  texto,
  opcoes,
  colunas,
  index,
  register,
  watch
}) => {
  return (
    <Box borderRadius="md" p={4} w="100%">
      <Text mb={4} fontWeight="bold" textAlign="left">
        {texto}
      </Text>

      <VStack w="100%" gap={0}>
        {/* Cabeçalho */}
        <HStack w="100%" alignItems="flex-end" gap={0}>
          <Box minW="220px" maxW="300px" w="25%" />
          {colunas.map((coluna) => (
            <Box
              key={coluna.id}
              flex={1}
              minW="80px"
              textAlign="center"
              fontWeight="medium"
              wordBreak="break-word"
              display="flex"
              flexDirection="column"
              justifyContent="flex-end"
              px={2}
            >
              <Text fontSize="xs" wordBreak="break-word">{coluna.texto}</Text>
            </Box>
          ))}
        </HStack>

        {opcoes.map((linha, rowIdx) => (
          <HStack key={linha.id} borderRadius="md" w="100%" bg={rowIdx % 2 === 0 ? "gray.50" : "white"} gap={0}>
            <Box minW="220px" maxW="300px" w="25%" textAlign="left" px={4} py={3} fontSize="sm">{linha.texto}</Box>
            {colunas.map((coluna) => (
              <Box key={coluna.id} flex={1} minW="80px" textAlign="center" px={2} py={3}>
                <RadioGroup.Root
                  value={watch(`${index}.resposta.${linha.id}`) || ""}
                  cursor="pointer"
                  w="100%"
                  ml="0"
                  {...register(`${index}.resposta.${linha.id}`)}
                >
                  <RadioGroup.Item
                    value={String(coluna.id)}
                    key={coluna.id}
                    colorScheme="purple"
                  >
                    <RadioGroup.ItemHiddenInput />
                    <RadioGroup.ItemIndicator />
                  </RadioGroup.Item>
                </RadioGroup.Root>
              </Box>
            ))}
          </HStack>
        ))}
      </VStack>
    </Box>
  );
};