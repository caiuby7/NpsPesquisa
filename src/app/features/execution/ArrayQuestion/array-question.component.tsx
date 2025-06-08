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

      <VStack w="100%">
        {/* Cabeçalho */}
        <HStack pl="15%" w="100%" justifyContent="space-around">
          {colunas.map((coluna) => (
            <Box
              key={coluna.id}
              w="60px"
              textAlign="center"
              fontWeight="medium"
            >
              {coluna.texto}
            </Box>
          ))}
        </HStack>

        {opcoes.map((linha) => (
          <HStack key={linha.id} borderRadius="md" w="100%">
            <Box w="15%">{linha.texto}</Box>
            <HStack w="100%" justifyContent="space-around">
              {colunas.map((coluna) => (
                <RadioGroup.Root
                  value={watch(`${index}.resposta.${linha.id}`) || ""}
                  cursor="pointer"
                  w="60px"
                  ml="42px"
                  key={coluna.id}
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
              ))}
            </HStack>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
};