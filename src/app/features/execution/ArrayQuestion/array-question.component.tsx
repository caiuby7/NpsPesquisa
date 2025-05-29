/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  Text,
  HStack,
  VStack,
  Button,
  Stack,
  RadioGroup,
} from "@chakra-ui/react";
import { useState } from "react";

interface Option {
  id: string;
  texto: string;
  ordem: number;
  peso: number;
}

interface MatrixQuestionProps {
  texto: string;
  opcoes: Option[];
  colunas: Option[];
}

export const MatrixQuestion: React.FC<MatrixQuestionProps> = ({
  texto,
  opcoes,
  colunas,
}) => {
  const [respostas, setRespostas] = useState<Record<string, string>>({});

  const handleChange = (linhaId: string, colunaId: string) => {
        setRespostas((prev) => ({
      ...prev,
      [linhaId]: colunaId,
    }));
    

  };

  const limparSelecao = () => {
    setRespostas({});
  };

  return (
    <Box borderRadius="md" p={4} w="100%">
      <Text mb={4} fontWeight="bold" textAlign="left">
        {texto}
      </Text>

      <VStack w="100%">
        {/* Cabeçalho */}
        <HStack pl="10%" w="100%" justifyContent="space-around">
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
            <Box w="10%">{linha.texto}</Box>
            <HStack w="100%" justifyContent="space-around">
              {colunas.map((coluna) => (
                <RadioGroup.Root
                  value={respostas[linha.id] || ""}
                  cursor="pointer"
                  w="60px"
                  ml="42px"
                  key={coluna.id}
                  onChange={() => handleChange(linha.id, coluna.id)}
                  
                >
                  <RadioGroup.Item
                    value={coluna.id}
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

      <Stack mt={4} direction="row" justify="flex-end">
        <Button variant="ghost" color="gray.600" onClick={limparSelecao}>
          Limpar seleção
        </Button>
      </Stack>
    </Box>
  );
};
