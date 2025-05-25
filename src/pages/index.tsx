// pages/form-builder.tsx
import { Box, Heading } from "@chakra-ui/react";
import CreateQuestion from "@/app/features/create-question/create-question.component";
import { EscalaLinear } from "@/app/components/execution/LinearScale/linear-scale.component";
import { MatrixQuestion } from "@/app/components/execution/ArrayQuestion/array-question.component";

export default function FormBuilderPage() {
  return (
    <Box p={8}>
      <Heading mb={6}>Criar Questão</Heading>
      <CreateQuestion />
      <EscalaLinear
        min={0}
        max={10}
        minLabel={"Ruim"}
        maxLabel={"Bom"}
        value={""}
        onChange={console.log}
      />
      <MatrixQuestion
        texto="Como você avalia os seguintes aspectos?"
        opcoes={[
          { idOpcao: "linha1", texto: "Linha 1", ordem: 1, peso: 1 },
          { idOpcao: "linha2", texto: "Linha 2", ordem: 2, peso: 1 },
        ]}
        colunas={[
          { idOpcao: "col1", texto: "Coluna 1", ordem: 1, peso: 1 },
          { idOpcao: "col2", texto: "Coluna 2", ordem: 2, peso: 1 },
        ]}
      />
    </Box>
  );
}
