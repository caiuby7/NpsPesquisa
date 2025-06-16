/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Text } from "@chakra-ui/react";
import { Control } from "react-hook-form";
import { QuestionResponse } from "../../../services/form";
import { CustomSelect } from "../../../components/Select/select.component";

interface Props {
  question: QuestionResponse;
  control: Control<any>;
  index: number;
}

export default function MenuExecution({ question, control, index }: Props) {
  const options = question.opcoes?.map((opcao) => ({
    value: opcao.id,
    label: opcao.texto,
  })) || [];

  return (
    <Box>
      <Text mb={4} fontWeight="bold" textAlign="left">
        {question.texto}
      </Text>
      <CustomSelect
        control={control}
        name={`${index}.resposta`}
        items={options}
        placeholder="Selecione uma opção"
      />
    </Box>
  );
}
