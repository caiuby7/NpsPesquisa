/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  Text,
  HStack,
  VStack,
  Radio,
  RadioGroup,
} from "@chakra-ui/react";
import { UseFormRegister, UseFormWatch } from "react-hook-form";
import { OptionItem } from "../../../services/form/form.services.types";

interface Props {
  texto: string;
  opcoes: OptionItem[];
  colunas: OptionItem[];
  watch: UseFormWatch<any>;
  register: UseFormRegister<any>;
  index: number;
}

export function MatrixQuestion({
  texto,
  opcoes,
  colunas,
  watch,
  register,
  index,
}: Props) {
  return (
    <VStack align="stretch" spacing={4}>
      <Text fontWeight="bold">{texto}</Text>
      <Box overflowX="auto">
        <HStack spacing={0} align="stretch">
          <Box flex={1} minW="120px" px={2} py={3}>
            <Text fontWeight="medium">Opções</Text>
          </Box>
          {colunas.map((coluna) => (
            <Box key={coluna.id} flex={1} minW="80px" textAlign="center" px={2} py={3}>
              <Text fontWeight="medium">{coluna.texto}</Text>
            </Box>
          ))}
        </HStack>
        {opcoes.map((linha) => (
          <HStack key={linha.id} spacing={0} align="stretch">
            <Box flex={1} minW="120px" px={2} py={3}>
              <Text>{linha.texto}</Text>
            </Box>
            {colunas.map((coluna) => (
              <Box key={coluna.id} flex={1} minW="80px" textAlign="center" px={2} py={3}>
                <RadioGroup
                  value={watch(`${index}.resposta.${linha.id}`) || ""}
                  onChange={(value) => register(`${index}.resposta.${linha.id}`).onChange({ target: { value } })}
                >
                  <Radio
                    value={String(coluna.id)}
                    key={coluna.id}
                    colorScheme="purple"
                  />
                </RadioGroup>
              </Box>
            ))}
          </HStack>
        ))}
      </Box>
    </VStack>
  );
}
