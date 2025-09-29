import { Box, Input, Stack, Text, Textarea } from '@chakra-ui/react';
import { QuestionResponse } from '../../services/form';

interface QuestionTypeExecutionProps {
  type: string;
  question: QuestionResponse;
  onChange: (value: any) => void;
  value: any;
}

export function QuestionTypeExecution({
  type,
  question,
  onChange,
  value,
}: QuestionTypeExecutionProps) {
  // Escala Linear (0 a 10, com textos nas extremidades)
  if (type === 'LINEAR_SCALE') {
    const minOption = question.opcoes?.find((o) => o.valor === '0');
    const maxOption = question.opcoes?.find((o) => o.valor === '10');
    return (
      <Box>
        <Text mb={2}>{question.texto}</Text>
        <Stack direction="row" spacing={4} align="center">
          <Text>{minOption?.texto}</Text>
          <Input
            type="range"
            min="0"
            max="10"
            value={value || 0}
            onChange={(e) => onChange(Number(e.target.value))}
          />
          <Text>{maxOption?.texto}</Text>
        </Stack>
      </Box>
    );
  }

  // Múltipla Escolha
  if (type === 'MULTIPLE_CHOICE') {
    return (
      <Box>
        <Text mb={2}>{question.texto}</Text>
        <Stack gap={2}>
          {question.opcoes?.map((opcao) => (
            <Box key={opcao.id} as="label" cursor="pointer">
              <input
                type="radio"
                name={question.id}
                value={opcao.id}
                checked={value === opcao.id}
                onChange={(e) => onChange(e.target.value)}
              />
              <Text ml={2} display="inline">
                {opcao.texto}
              </Text>
            </Box>
          ))}
        </Stack>
      </Box>
    );
  }

  // Caixa de Seleção (Checkbox)
  if (type === 'CHECKBOX') {
    const selectedValues = Array.isArray(value) ? value : (value ? [value] : []);
    
    return (
      <Box>
        <Text mb={2}>{question.texto}</Text>
        <Stack gap={2}>
          {question.opcoes?.map((opcao) => (
            <Box key={opcao.id} as="label" cursor="pointer">
              <input
                type="checkbox"
                name={question.id}
                value={opcao.id}
                checked={selectedValues.includes(opcao.id)}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  let newValues;
                  
                  if (isChecked) {
                    newValues = [...selectedValues, opcao.id];
                  } else {
                    newValues = selectedValues.filter(id => id !== opcao.id);
                  }
                  
                  onChange(newValues);
                }}
              />
              <Text ml={2} display="inline">
                {opcao.texto}
              </Text>
            </Box>
          ))}
        </Stack>
      </Box>
    );
  }

  // Resposta Curta
  if (type === 'SHORT_ANSWER') {
    return (
      <Box>
        <Text mb={2}>{question.texto}</Text>
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Digite sua resposta"
        />
      </Box>
    );
  }

  // Parágrafo
  if (type === 'PARAGRAPH') {
    return (
      <Box>
        <Text mb={2}>{question.texto}</Text>
        <Textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Digite sua resposta"
          rows={4}
        />
      </Box>
    );
  }

  // Menu Suspenso
  if (type === 'DROPDOWN') {
    return (
      <Box>
        <Text mb={2}>{question.texto}</Text>
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
        >
          <option value="">Selecione uma opção</option>
          {question.opcoes?.map((opcao) => (
            <option key={opcao.id} value={opcao.id}>
              {opcao.texto}
            </option>
          ))}
        </select>
      </Box>
    );
  }

  // Matriz
  if (type === 'MATRIX') {
    return (
      <Box>
        <Text mb={2}>{question.texto}</Text>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th></th>
              {question.colunas?.map((col) => (
                <th key={col.id} style={{ padding: 4, border: '1px solid #ccc' }}>
                  {col.texto}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {question.opcoes?.map((opcao, rowIdx) => (
              <tr key={opcao.id}>
                <td style={{ padding: 4, border: '1px solid #ccc' }}>{opcao.texto}</td>
                {question.colunas?.map((col, colIdx) => (
                  <td key={col.id} style={{ textAlign: 'center', border: '1px solid #ccc' }}>
                    <input
                      type="radio"
                      name={`${question.id}-${opcao.id}`}
                      value={col.id}
                      checked={value?.[opcao.id] === col.id}
                      onChange={() =>
                        onChange({
                          ...value,
                          [opcao.id]: col.id,
                        })
                      }
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    );
  }

  return null;
} 
