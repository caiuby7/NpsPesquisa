import { AnswersFormType } from "@/app/widgets/execution-question/use-execution-answer";
import {
  Box,
  Text,
  HStack,
  VStack,
  Button,
  Stack,
  RadioGroup,
} from "@chakra-ui/react";
import { UseFormRegister } from "react-hook-form";
//import { useState } from "react";

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
  register: UseFormRegister<AnswersFormType>;
  index: number
}

export const MatrixQuestion: React.FC<MatrixQuestionProps> = ({
  texto,
  opcoes,
  colunas,
  index,
  register
}) => {
  //const [setRespostas] = useState<Record<string, string>>({});

  const handleChange = (linhaId: string, colunaId: string) => {
    console.log(linhaId, colunaId)
    /*
        setRespostas((prev) => ({
      ...prev,
      [linhaId]: colunaId,
    }));
    */

  };

  const limparSelecao = () => {
    //setRespostas({});
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
              key={coluna.idOpcao}
              w="60px"
              textAlign="center"
              fontWeight="medium"
            >
              {coluna.texto}
            </Box>
          ))}
        </HStack>

        {opcoes.map((linha, linhaIndex) => (
          <HStack
            key={linha.idOpcao}
            borderRadius="md"
            w="100%"
          >
            <Box w="10%">{linha.texto}</Box>
            <HStack w="100%" justifyContent="space-around">
              {colunas.map((coluna) => (
                <RadioGroup.Root value={""} w="60px" ml="42px" key={coluna.idOpcao} {...register(`${index}.resposta.${linhaIndex}.idLinha`)}>
                  <RadioGroup.Item
                    value={coluna.idOpcao}
                    key={coluna.idOpcao}
                    colorScheme="purple"
                     {...register(`${index}.resposta.${linhaIndex}.idLinha`)}
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
