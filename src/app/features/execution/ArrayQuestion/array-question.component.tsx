/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  Text,
  Stack,
  Button,
  RadioGroup,
} from "@chakra-ui/react";
import { useState } from "react";

interface Option {
  id: string;
  texto: string;
  ordem: number;
  peso: number;
  ehColuna?: boolean;
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
  console.log('MatrixQuestion props:', { texto, opcoes, colunas });
  const [respostas, setRespostas] = useState<Record<string, string>>({});

  const limparSelecao = () => {
    setRespostas({});
  };

  if (!colunas || colunas.length === 0) {
    console.warn('MatrixQuestion: No columns provided');
    return null;
  }

  if (!opcoes || opcoes.length === 0) {
    console.warn('MatrixQuestion: No options provided');
    return null;
  }

  // Ordenar opções e colunas por ordem
  const opcoesOrdenadas = [...opcoes].sort((a, b) => a.ordem - b.ordem);
  const colunasOrdenadas = [...colunas].sort((a, b) => a.ordem - b.ordem);

  return (
    <Box
      borderRadius="md"
      p={{ base: 1, md: 3 }}
      w="100%"
      maxW={{ base: "100%", md: "none" }}
      bg="white"
      shadow="sm"
    >
      <Text mb={6} fontWeight="bold" fontSize="lg" textAlign="left">
        {texto}
      </Text>
      <Box overflowX="auto" w="100%">
        <Box as="table" w="100%" minWidth="600px" borderSpacing={0}>
          <Box as="thead">
            <Box as="tr">
              <Box as="th" w="300px"></Box>
              {colunasOrdenadas.map((coluna) => (
                <Box
                  as="th"
                  key={coluna.id}
                  textAlign="center"
                  fontWeight="medium"
                  fontSize="14px"
                  color="gray.600"
                  px={2}
                  py={1}
                >
                  {coluna.texto}
                </Box>
              ))}
            </Box>
          </Box>
          <Box as="tbody">
            {opcoesOrdenadas.map((linha) => (
              <Box as="tr" key={linha.id}>
                <Box
                  as="td"
                  fontSize="14px"
                  color="gray.700"
                  px={2}
                  py={1}
                  borderBottom="1px solid #eee"
                  w="300px"
                >
                  {linha.texto}
                </Box>
                {colunasOrdenadas.map((coluna) => (
                  <Box
                    as="td"
                    key={coluna.id}
                    textAlign="center"
                    borderBottom="1px solid #eee"
                    px={2}
                    py={1}
                  >
                    <RadioGroup.Root
                      value={respostas[linha.id] || ""}
                      cursor="not-allowed"
                      onChange={() => {}}
                      disabled
                    >
                      <RadioGroup.Item
                        value={coluna.id}
                        key={coluna.id}
                        colorScheme="purple"
                        border="2px solid #222"
                        bg="white"
                        opacity={1}
                        borderRadius="50%"
                        w="18px"
                        h="18px"
                        _checked={{ bg: '#222', borderColor: '#222' }}
                        _disabled={{ bg: 'white', borderColor: '#222', opacity: 1 }}
                        disabled
                      >
                        <RadioGroup.ItemHiddenInput />
                        <RadioGroup.ItemIndicator />
                      </RadioGroup.Item>
                    </RadioGroup.Root>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
      {Object.keys(respostas).length > 0 && (
        <Stack mt={6} direction="row" justify="flex-end">
          <Button
            variant="ghost"
            color="gray.600"
            onClick={limparSelecao}
            size="sm"
          >
            Limpar seleção
          </Button>
        </Stack>
      )}
    </Box>
  );
};
