import { Box, Input, Stack, Text, Textarea, HStack } from "@chakra-ui/react";
import { QuestionResponse } from "../../services/form";

interface QuestionTypeExecutionProps {
  type: string;
  question: QuestionResponse;
  onChange: (value: any) => void;
  value?: any;
  requiredAsterisk?: boolean;
}

export function QuestionTypeExecution({ type, question, onChange, value, requiredAsterisk }: QuestionTypeExecutionProps) {
  // Escala Linear (0 a 10, com textos nas extremidades)
  if (type === "EscalaLinear") {
    const minOption = question.opcoes?.find(o => o.valor === "0");
    const maxOption = question.opcoes?.find(o => o.valor === "10");
    const min = 0;
    const max = 10;
    const range = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    return (
      <Box>
        <Text mb={2}>
          {question.texto}
          {requiredAsterisk && <span style={{ color: 'red', marginLeft: 4 }}>*</span>}
        </Text>
        {/* Labels extremos nas extremidades, mesma linha */}
        <HStack justify="space-between" w="100%" mb={1}>
          <Text fontSize="sm" color="gray.600" fontWeight="semibold">
            {minOption?.texto}
          </Text>
          <Text fontSize="sm" color="gray.600" fontWeight="semibold">
            {maxOption?.texto}
          </Text>
        </HStack>
        <Stack direction="row" justify="center" align="center">
          {range.map((val) => (
            <Box
              as="label"
              key={val}
              w="48px"
              textAlign="center"
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={val}
                checked={value == val}
                onChange={() => onChange(val)}
                style={{ display: "none" }}
                required={!!question.obrigatorio}
              />
              <Text as="span" fontSize="md" borderRadius="full" px={2} py={1} bg={value == val ? "blue.100" : "gray.100"} border={value == val ? "2px solid #3182ce" : "1px solid #ccc"}>{val}</Text>
            </Box>
          ))}
        </Stack>
      </Box>
    );
  }

  // Múltipla Escolha
  if (type === "MultiplaEscolha") {
    return (
      <Box>
        <Text mb={2}>
          {question.texto}
          {requiredAsterisk && <span style={{ color: 'red', marginLeft: 4 }}>*</span>}
        </Text>
        <Stack gap={2}>
          {question.opcoes?.map((opcao) => (
            <Box key={opcao.id} as="label" cursor="pointer">
              <input
                type="radio"
                name={`question-${question.id}`}
                value={opcao.id.toString()}
                checked={value == opcao.id}
                onChange={() => onChange(opcao.id)}
                required={!!question.obrigatorio}
              />
              <Text as="span" ml={2}>{opcao.texto}</Text>
            </Box>
          ))}
        </Stack>
      </Box>
    );
  }

  // Caixa de Texto
  if (type === "CaixaTexto") {
    return (
      <Box>
        <Text mb={2}>
          {question.texto}
          {requiredAsterisk && <span style={{ color: 'red', marginLeft: 4 }}>*</span>}
        </Text>
        <Textarea value={value || ""} onChange={e => onChange(e.target.value)} required={!!question.obrigatorio} />
      </Box>
    );
  }

  // Menu Suspenso
  if (type === "MenuSuspenso") {
    return (
      <Box>
        <Text mb={2}>
          {question.texto}
          {requiredAsterisk && <span style={{ color: 'red', marginLeft: 4 }}>*</span>}
        </Text>
        <select value={value || ""} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }} required={!!question.obrigatorio}>
          <option value="">Selecione uma opção</option>
          {question.opcoes?.map((opcao) => (
            <option key={opcao.id} value={opcao.id}>{opcao.texto}</option>
          ))}
        </select>
      </Box>
    );
  }

  // Matriz (linhas = opcoes, colunas = colunas)
  if (type === "Matriz") {
    return (
      <Box>
        <Text mb={2}>
          {question.texto}
          {requiredAsterisk && <span style={{ color: 'red', marginLeft: 4 }}>*</span>}
        </Text>
        <Box overflowX="auto">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th></th>
                {question.colunas?.map((col) => (
                  <th key={col.id} style={{ padding: 4, border: "1px solid #ccc" }}>{col.texto}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {question.opcoes?.map((opcao, rowIdx) => (
                <tr key={opcao.id}>
                  <td style={{ padding: 4, border: "1px solid #ccc" }}>{opcao.texto}</td>
                  {question.colunas?.map((col, colIdx) => (
                    <td key={col.id} style={{ textAlign: "center", border: "1px solid #ccc" }}>
                      <input
                        type="radio"
                        name={`question-${question.id}-row-${rowIdx}`}
                        value={col.id}
                        checked={value && value[rowIdx] == col.id}
                        onChange={() => {
                          const newValue = Array.isArray(value) ? [...value] : [];
                          newValue[rowIdx] = col.id;
                          onChange(newValue);
                        }}
                        required={!!question.obrigatorio}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Box>
    );
  }

  // Default: Input texto
  return (
    <Box>
      <Text mb={2}>
        {question.texto}
        {requiredAsterisk && <span style={{ color: 'red', marginLeft: 4 }}>*</span>}
      </Text>
      <Input type="text" value={value || ""} onChange={e => onChange(e.target.value)} required={!!question.obrigatorio} />
    </Box>
  );
} 