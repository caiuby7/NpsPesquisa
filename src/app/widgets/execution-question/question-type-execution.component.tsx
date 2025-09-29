import { Box, Input, Stack, Text, Textarea, HStack } from "@chakra-ui/react";
import { QuestionResponse } from "../../services/form";

interface QuestionTypeExecutionProps {
  type: string;
  question: QuestionResponse;
  onChange: (value: any) => void;
  value?: any;
  requiredAsterisk?: boolean;
  itemAvaliadoId?: number;
  isVisible?: boolean; // Nova prop para controlar se a questão é visível
}

export function QuestionTypeExecution({ type, question, onChange, value, requiredAsterisk, itemAvaliadoId, isVisible = true }: QuestionTypeExecutionProps) {
  // Controlar se o campo deve ser obrigatório (só se a questão for obrigatória E visível)
  const shouldBeRequired = question.obrigatorio && isVisible;
  
  // Debug logs
  console.log('🔍 QuestionTypeExecution render:', {
    questionId: question.id,
    type,
    value,
    valueType: typeof value,
    isVisible,
    shouldBeRequired,
    obrigatorio: question.obrigatorio,
    onChange: typeof onChange,
    timestamp: new Date().toISOString()
  });
  
  // Escala Linear (0 a 10, com textos nas extremidades)
  if (type === "EscalaLinear") {
    const minOption = question.opcoes?.find(o => o.valor === "0");
    const maxOption = question.opcoes?.find(o => o.valor === "10");
    const min = 0;
    const max = 10;
    const range = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    return (
      <Box>
        <Text 
          mb={5} 
          fontSize="lg" 
          fontWeight="medium" 
          color="gray.700"
          lineHeight="1.5"
        >
          {question.texto}
          {requiredAsterisk && <Text as="span" color="red.500" ml={1}>*</Text>}
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
                name={`question-${question.id}-${itemAvaliadoId || 'normal'}`}
                value={val}
                checked={value == val}
                onChange={() => onChange(val)}
                style={{ display: "none" }}
                required={shouldBeRequired}
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
    console.log('🔍 MultiplaEscolha render:', {
      questionId: question.id,
      opcoes: question.opcoes?.map(o => ({ id: o.id, texto: o.texto })),
      value,
      checkedOptions: question.opcoes?.map(o => ({ id: o.id, checked: value == o.id }))
    });
    
    return (
      <Box>
        <Text 
          mb={5} 
          fontSize="lg" 
          fontWeight="medium" 
          color="gray.700"
          lineHeight="1.5"
        >
          {question.texto}
          {requiredAsterisk && <Text as="span" color="red.500" ml={1}>*</Text>}
        </Text>
        <Stack gap={2}>
          {question.opcoes?.filter(opcao => opcao && opcao.id).map((opcao) => {
            const isChecked = Number(value) === Number(opcao.id);
            console.log('🔍 Opção render:', {
              questionId: question.id,
              opcaoId: opcao.id,
              opcaoIdType: typeof opcao.id,
              opcaoTexto: opcao.texto,
              value,
              valueType: typeof value,
              isChecked,
              comparison: `${value} == ${opcao.id} = ${value == opcao.id}`,
              onChange: typeof onChange,
              timestamp: new Date().toISOString()
            });
            
            return (
              <Box 
                key={`${question.id}-${opcao.id}`} 
                as="label" 
                cursor="pointer"
                p={3}
                borderRadius="md"
                border="1px solid"
                borderColor={isChecked ? "blue.300" : "gray.200"}
                bg={isChecked ? "blue.50" : "white"}
                _hover={{
                  borderColor: isChecked ? "blue.400" : "blue.200",
                  bg: isChecked ? "blue.100" : "gray.50"
                }}
                transition="all 0.2s"
              >
                <HStack spacing={3}>
                  <input
                    type="radio"
                    name={`question-${question.id}-${itemAvaliadoId || 'normal'}`}
                    value={opcao.id.toString()}
                    checked={isChecked}
                    onChange={() => {
                      console.log('📻 Radio onChange chamado:', { 
                        questionId: question.id, 
                        questionIdType: typeof question.id,
                        opcaoId: opcao.id, 
                        opcaoIdType: typeof opcao.id,
                        value,
                        currentValue: value
                      });
                      onChange(opcao.id);
                    }}
                    required={shouldBeRequired}
                    style={{ 
                      width: "18px", 
                      height: "18px",
                      accentColor: "#3182ce"
                    }}
                  />
                  <Text 
                    as="span" 
                    fontSize="md" 
                    color={isChecked ? "blue.700" : "gray.700"}
                    fontWeight={isChecked ? "medium" : "normal"}
                  >
                    {opcao.texto}
                  </Text>
                </HStack>
              </Box>
            );
          })}
        </Stack>
      </Box>
    );
  }

  // Caixa de Texto
  if (type === "CaixaTexto") {
    return (
      <Box>
        <Text 
          mb={5} 
          fontSize="lg" 
          fontWeight="medium" 
          color="gray.700"
          lineHeight="1.5"
        >
          {question.texto}
          {requiredAsterisk && <Text as="span" color="red.500" ml={1}>*</Text>}
        </Text>
        <Textarea value={value || ""} onChange={e => onChange(e.target.value)} required={!!question.obrigatorio} />
      </Box>
    );
  }

  // Menu Suspenso
  if (type === "MenuSuspenso") {
    return (
      <Box>
        <Text 
          mb={5} 
          fontSize="lg" 
          fontWeight="medium" 
          color="gray.700"
          lineHeight="1.5"
        >
          {question.texto}
          {requiredAsterisk && <Text as="span" color="red.500" ml={1}>*</Text>}
        </Text>
        <select value={value || ""} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }} required={!!question.obrigatorio}>
          <option value="">Selecione uma opção</option>
          {question.opcoes?.map((opcao) => (
            <option key={`${question.id}-${opcao.id}`} value={opcao.id}>{opcao.texto}</option>
          ))}
        </select>
      </Box>
    );
  }

  // Matriz (linhas = opcoes, colunas = colunas)
  if (type === "Matriz") {
    return (
      <Box>
        <Text 
          mb={5} 
          fontSize="lg" 
          fontWeight="medium" 
          color="gray.700"
          lineHeight="1.5"
        >
          {question.texto}
          {requiredAsterisk && <Text as="span" color="red.500" ml={1}>*</Text>}
        </Text>
        <Box overflowX="auto">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th></th>
                {question.colunas?.map((col) => (
                  <th key={`${question.id}-col-${col.id}`} style={{ padding: 4, border: "1px solid #ccc" }}>{col.texto}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {question.opcoes?.map((opcao, rowIdx) => (
                <tr key={`${question.id}-row-${opcao.id}`}>
                  <td style={{ padding: 4, border: "1px solid #ccc" }}>{opcao.texto}</td>
                  {question.colunas?.map((col, colIdx) => (
                    <td key={`${question.id}-cell-${opcao.id}-${col.id}`} style={{ textAlign: "center", border: "1px solid #ccc" }}>
                      <input
                        type="radio"
                        name={`question-${question.id}-${itemAvaliadoId || 'normal'}-row-${rowIdx}`}
                        value={col.id}
                        checked={value && value[rowIdx] == col.id}
                        onChange={() => {
                          const newValue = Array.isArray(value) ? [...value] : [];
                          newValue[rowIdx] = col.id;
                          onChange(newValue);
                        }}
                        required={shouldBeRequired}
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

  // Caixa de Seleção (Checkbox)
  if (type === "CaixaSelecao") {
    const selectedValues = Array.isArray(value) ? value : (value ? [value] : []);
    
    return (
      <Box>
        <Text 
          mb={5} 
          fontSize="lg" 
          fontWeight="medium" 
          color="gray.700"
          lineHeight="1.5"
        >
          {question.texto}
          {requiredAsterisk && <Text as="span" color="red.500" ml={1}>*</Text>}
        </Text>
        <Stack gap={2}>
          {question.opcoes?.map((opcao) => (
            <Box 
              key={`${question.id}-${opcao.id}`} 
              as="label" 
              cursor="pointer"
              p={3}
              borderRadius="md"
              border="1px solid"
              borderColor={selectedValues.includes(String(opcao.id)) ? "blue.300" : "gray.200"}
              bg={selectedValues.includes(String(opcao.id)) ? "blue.50" : "white"}
              _hover={{
                borderColor: selectedValues.includes(String(opcao.id)) ? "blue.400" : "blue.200",
                bg: selectedValues.includes(String(opcao.id)) ? "blue.100" : "gray.50"
              }}
              transition="all 0.2s"
            >
              <HStack spacing={3}>
                <input
                  type="checkbox"
                  name={`question-${question.id}-${itemAvaliadoId || 'normal'}`}
                  value={String(opcao.id)}
                  checked={selectedValues.includes(String(opcao.id))}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    const opcaoId = String(opcao.id);
                    let newValues;
                    
                    if (isChecked) {
                      // Adicionar à seleção
                      newValues = [...selectedValues, opcaoId];
                    } else {
                      // Remover da seleção
                      newValues = selectedValues.filter(id => id !== opcaoId);
                    }
                    
                    onChange(newValues);
                  }}
                  required={shouldBeRequired}
                />
                <Text>
                  {opcao.texto}
                </Text>
              </HStack>
            </Box>
          ))}
        </Stack>
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
