import { Box, Input, Stack, Text, Textarea } from "@chakra-ui/react";
import { QuestionResponse } from "@/app/services/form";

interface QuestionTypeExecutionProps {
  type: string;
  question: QuestionResponse;
  onChange: (value: any) => void;
  value?: any;
}

export function QuestionTypeExecution({ type, question, onChange, value }: QuestionTypeExecutionProps) {
  // Escala Linear (0 a 10, com textos nas extremidades)
  if (type === "EscalaLinear") {
    const minOption = question.opcoes?.find(o => o.valor === "0");
    const maxOption = question.opcoes?.find(o => o.valor === "10");
    return (
      <Box>
        <Text mb={2}>{question.texto}</Text>
        <Stack direction="row" align="center" gap={4}>
          <Text minW="100px" textAlign="right">{minOption?.texto}</Text>
          <Stack direction="row" gap={1}>
            {Array.from({ length: 11 }).map((_, idx) => (
              <Box
                as="label"
                key={idx}
                cursor="pointer"
                p={1}
                borderRadius="md"
                bg={value == idx ? "blue.100" : "gray.100"}
                border={value == idx ? "2px solid #3182ce" : "1px solid #ccc"}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={idx}
                  checked={value == idx}
                  onChange={() => onChange(idx)}
                  style={{ display: "none" }}
                />
                <Text as="span">{idx}</Text>
              </Box>
            ))}
          </Stack>
          <Text minW="100px" textAlign="left">{maxOption?.texto}</Text>
        </Stack>
      </Box>
    );
  }

  // Múltipla Escolha
  if (type === "MultiplaEscolha") {
    return (
      <Box>
        <Text mb={2}>{question.texto}</Text>
        <Stack gap={2}>
          {question.opcoes?.map((opcao) => (
            <Box key={opcao.id} as="label" cursor="pointer">
              <input
                type="radio"
                name={`question-${question.id}`}
                value={opcao.id.toString()}
                checked={value == opcao.id}
                onChange={() => onChange(opcao.id)}
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
        <Text mb={2}>{question.texto}</Text>
        <Textarea value={value || ""} onChange={e => onChange(e.target.value)} />
      </Box>
    );
  }

  // Menu Suspenso
  if (type === "MenuSuspenso") {
    return (
      <Box>
        <Text mb={2}>{question.texto}</Text>
        <select value={value || ""} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }}>
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
        <Text mb={2}>{question.texto}</Text>
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
      <Text mb={2}>{question.texto}</Text>
      <Input type="text" value={value || ""} onChange={e => onChange(e.target.value)} />
    </Box>
  );
} 