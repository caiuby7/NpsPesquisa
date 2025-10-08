import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Select,
  Switch,
  FormControl,
  FormLabel,
  Divider,
  Alert,
  AlertIcon,
  Badge,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiEdit3 } from 'react-icons/fi';

export interface Combinacao {
  id: string;
  origem: string;
  destino: string[];
  permitido: boolean;
  opcoes?: string[];
}

interface EditorCombinacoesProps {
  combinacoes: Combinacao[];
  onCombinacoesChange: (combinacoes: Combinacao[]) => void;
  tipoOrigem: string;
  tipoDestino: string;
  opcoesOrigem: string[];
  opcoesDestino: string[];
  isLoading?: boolean;
}

export const EditorCombinacoes: React.FC<EditorCombinacoesProps> = ({
  combinacoes,
  onCombinacoesChange,
  tipoOrigem,
  tipoDestino,
  opcoesOrigem,
  opcoesDestino,
  isLoading = false
}) => {
  const toast = useToast();
  const [combinacoesLocais, setCombinacoesLocais] = useState<Combinacao[]>(combinacoes);

  // Atualizar estado local quando props mudarem
  useEffect(() => {
    setCombinacoesLocais(combinacoes);
  }, [combinacoes]);

  const gerarIdUnico = () => `combinacao-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const adicionarCombinacao = () => {
    const novaCombinacao: Combinacao = {
      id: gerarIdUnico(),
      origem: opcoesOrigem[0] || '',
      destino: opcoesDestino.length > 0 ? [opcoesDestino[0]] : [],
      permitido: true
    };

    const novasCombinacoes = [...combinacoesLocais, novaCombinacao];
    setCombinacoesLocais(novasCombinacoes);
    onCombinacoesChange(novasCombinacoes);

    toast({
      title: 'Combinação adicionada',
      description: 'Nova combinação criada com sucesso',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const removerCombinacao = (id: string) => {
    const novasCombinacoes = combinacoesLocais.filter(c => c.id !== id);
    setCombinacoesLocais(novasCombinacoes);
    onCombinacoesChange(novasCombinacoes);

    toast({
      title: 'Combinação removida',
      description: 'Combinação excluída com sucesso',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const atualizarCombinacao = (id: string, campo: keyof Combinacao, valor: any) => {
    console.log(`🔧 Atualizando combinação ${id}:`, campo, valor);
    const novasCombinacoes = combinacoesLocais.map(c => 
      c.id === id ? { ...c, [campo]: valor } : c
    );
    console.log('🔧 Novas combinações:', novasCombinacoes);
    setCombinacoesLocais(novasCombinacoes);
    onCombinacoesChange(novasCombinacoes);
  };

  const verificarDuplicatas = (origem: string, destino: string[], excluirId?: string) => {
    return combinacoesLocais.some(c => 
      c.id !== excluirId && 
      c.origem === origem && 
      JSON.stringify(c.destino.sort()) === JSON.stringify(destino.sort())
    );
  };

  const obterDestinosPermitidos = (origemSelecionada: string) => {
    // Filtrar opções de destino que fazem sentido com a origem selecionada
    // Por exemplo: se origem é "EAD", talvez alguns tipos de professor não sejam válidos
    return opcoesDestino;
  };

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Text fontSize="lg" fontWeight="bold" color="gray.700">
              Combinações da Regra
            </Text>
            <Text fontSize="sm" color="gray.600">
              {tipoOrigem} → {tipoDestino}
            </Text>
          </VStack>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="blue"
            size="sm"
            onClick={adicionarCombinacao}
            isDisabled={isLoading || opcoesOrigem.length === 0 || opcoesDestino.length === 0}
          >
            Adicionar
          </Button>
        </HStack>

        {/* Aviso se não há opções */}
        {opcoesOrigem.length === 0 || opcoesDestino.length === 0 ? (
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <Text fontSize="sm">
              {opcoesOrigem.length === 0 && opcoesDestino.length === 0 
                ? 'Configure os tipos de origem e destino primeiro'
                : opcoesOrigem.length === 0 
                ? 'Configure o tipo de origem primeiro'
                : 'Configure o tipo de destino primeiro'
              }
            </Text>
          </Alert>
        ) : null}

        {/* Lista de Combinações */}
        {combinacoesLocais.length === 0 ? (
          <Box p={6} textAlign="center" bg="gray.50" borderRadius="md" border="1px dashed" borderColor="gray.300">
            <Text color="gray.500" fontSize="sm">
              Nenhuma combinação definida
            </Text>
            <Text color="gray.400" fontSize="xs" mt={1}>
              Clique em "Adicionar" para criar a primeira combinação
            </Text>
          </Box>
        ) : (
          <VStack spacing={3} align="stretch">
            {combinacoesLocais.map((combinacao, index) => {
              const destinosPermitidos = obterDestinosPermitidos(combinacao.origem);
              const isDuplicada = verificarDuplicatas(combinacao.origem, combinacao.destino, combinacao.id);

              return (
                <Box
                  key={combinacao.id}
                  p={4}
                  bg={combinacao.permitido ? 'green.50' : 'red.50'}
                  borderRadius="md"
                  border="1px solid"
                  borderColor={combinacao.permitido ? 'green.200' : 'red.200'}
                  position="relative"
                >
                  <HStack spacing={3} align="start">
                    {/* Badge de Status */}
                    <Box>
                      <Badge
                        colorScheme={combinacao.permitido ? 'green' : 'red'}
                        fontSize="xs"
                        p={1}
                        borderRadius="full"
                      >
                        {combinacao.permitido ? '✓' : '✗'}
                      </Badge>
                    </Box>

                    {/* Campos da Combinação */}
                    <VStack spacing={3} align="stretch" flex="1">
                      {/* Linha 1: Origem */}
                      <FormControl>
                        <FormLabel fontSize="xs" color="gray.600">
                          {tipoOrigem} (Origem)
                        </FormLabel>
                        <Select
                          size="sm"
                          value={combinacao.origem}
                          onChange={(e) => atualizarCombinacao(combinacao.id, 'origem', e.target.value)}
                          isDisabled={isLoading}
                        >
                          {opcoesOrigem.map(opcao => (
                            <option key={opcao} value={opcao}>
                              {opcao}
                            </option>
                          ))}
                        </Select>
                      </FormControl>

                      {/* Linha 2: Destino */}
                      <FormControl>
                        <FormLabel fontSize="xs" color="gray.600">
                          {tipoDestino} (Destino) - Pode selecionar múltiplos
                        </FormLabel>
                        <VStack spacing={2} align="stretch">
                          {opcoesDestino.map(opcao => (
                            <HStack key={`${index}-${opcao}`} spacing={2}>
                              <input
                                type="checkbox"
                                id={`${combinacao.id}-${index}-${opcao}`}
                                checked={combinacao.destino.includes(opcao)}
                                onChange={(e) => {
                                  const novosDestinos = e.target.checked
                                    ? [...combinacao.destino, opcao]
                                    : combinacao.destino.filter(d => d !== opcao);
                                  atualizarCombinacao(combinacao.id, 'destino', novosDestinos);
                                }}
                                disabled={isLoading}
                              />
                              <Text fontSize="sm" as="label" htmlFor={`${combinacao.id}-${index}-${opcao}`} cursor="pointer">
                                {opcao}
                              </Text>
                            </HStack>
                          ))}
                        </VStack>
                        {combinacao.destino.length === 0 && (
                          <Text fontSize="xs" color="red.500" mt={1}>
                            Selecione pelo menos uma opção de destino
                          </Text>
                        )}
                      </FormControl>

                      {/* Linha 3: Permitido */}
                      <FormControl>
                        <HStack spacing={3}>
                          <Text fontSize="sm" color="gray.700">
                            Esta combinação é:
                          </Text>
                          <HStack spacing={2}>
                            <Text fontSize="sm" color={combinacao.permitido ? 'green.600' : 'red.600'}>
                              {combinacao.permitido ? 'PERMITIDA' : 'BLOQUEADA'}
                            </Text>
                            <Switch
                              isChecked={combinacao.permitido}
                              onChange={(e) => atualizarCombinacao(combinacao.id, 'permitido', e.target.checked)}
                              colorScheme={combinacao.permitido ? 'green' : 'red'}
                              isDisabled={isLoading}
                            />
                          </HStack>
                        </HStack>
                      </FormControl>

                      {/* Aviso de Duplicata */}
                      {isDuplicada && (
                        <Alert status="warning" size="sm">
                          <AlertIcon />
                          <Text fontSize="xs">
                            ⚠️ Combinação duplicada! Esta combinação já existe.
                          </Text>
                        </Alert>
                      )}
                    </VStack>

                    {/* Botão Remover */}
                    <Tooltip label="Remover combinação">
                      <IconButton
                        aria-label="Remover"
                        icon={<FiTrash2 />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => removerCombinacao(combinacao.id)}
                        isDisabled={isLoading}
                      />
                    </Tooltip>
                  </HStack>

                  {/* Preview da Combinação */}
                  <Box mt={3} pt={3} borderTop="1px solid" borderColor="gray.200">
                    <Text fontSize="xs" color="gray.500">
                      <strong>Preview:</strong> {combinacao.origem} → {combinacao.destino.join(', ')} = {combinacao.permitido ? 'PERMITIDO' : 'BLOQUEADO'}
                    </Text>
                  </Box>
                </Box>
              );
            })}
          </VStack>
        )}

        {/* Resumo */}
        {combinacoesLocais.length > 0 && (
          <Box p={3} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
            <Text fontSize="sm" color="blue.700" fontWeight="medium">
              📊 Resumo: {combinacoesLocais.length} combinação(ões) definida(s)
            </Text>
            <Text fontSize="xs" color="blue.600" mt={1}>
              {combinacoesLocais.filter(c => c.permitido).length} permitida(s) • {combinacoesLocais.filter(c => !c.permitido).length} bloqueada(s)
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default EditorCombinacoes;
