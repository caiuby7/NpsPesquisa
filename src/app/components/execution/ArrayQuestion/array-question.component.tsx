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
  idOpcao: string;
  texto: string;
  ordem: number;
  peso: number;
}

interface MatrixQuestionProps {
  texto: string;
  opcoes: Option[]; // linhas
  colunas: Option[]; // colunas
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
    <Box borderRadius="md" p={4} w="100%" borderWidth="1px" mt="24px">
      <Text mb={4} fontWeight="bold">
        {texto}
      </Text>

      <VStack spacing={2} w="100%">
        {/* Cabeçalho */}
        <HStack pl="10%" w="100%" justifyContent="space-around">
          {colunas.map((coluna) => (
            <Box
              key={coluna.idOpcao}
              w="60px"
              textAlign="center"
              fontWeight="medium"
            >
              {coluna.texto}
            </Box>
          ))}
        </HStack>

        {opcoes.map((linha) => (
          <HStack
            key={linha.idOpcao}
            borderRadius="md"
            w="100%"
          >
            <Box w="10%">{linha.texto}</Box>
            <HStack w="100%" justifyContent="space-around">
              {colunas.map((coluna) => (
                <RadioGroup.Root value={""} w="60px" ml="42px" key={coluna.idOpcao}>
                  <RadioGroup.Item
                    key={coluna.idOpcao}
                    value=""
                    onChange={() => handleChange(linha.idOpcao, coluna.idOpcao)}
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
        <Button variant="link" color="gray.600" onClick={limparSelecao}>
          Limpar seleção
        </Button>
      </Stack>
    </Box>
  );
};
