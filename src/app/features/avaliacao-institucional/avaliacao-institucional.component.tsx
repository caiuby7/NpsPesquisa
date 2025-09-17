import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Progress,
  Card,
  CardBody,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Radio,
  Icon,
  Badge,
  Heading,
  useColorModeValue,
  Container,
  Alert,
  AlertIcon,
  Button,
  useToast
} from '@chakra-ui/react';
import { 
  FaGraduationCap, 
  FaFileAlt, 
  FaChartBar, 
  FaCheckSquare,
  FaChevronDown,
  FaChevronRight,
  FaSave,
  FaUndo
} from 'react-icons/fa';
import { 
  useAvaliacaoInstitucional, 
  criteriosAvaliacao, 
  opcoesAvaliacao 
} from './use-avaliacao-institucional';

interface AvaliacaoInstitucionalProps {
  questionarioId: string;
}

export const AvaliacaoInstitucionalComponent: React.FC<AvaliacaoInstitucionalProps> = ({ 
  questionarioId 
}) => {
  const toast = useToast();
  const {
    disciplinas,
    progresso,
    secoesCompletas,
    totalSecoes,
    loading,
    error,
    atualizarAvaliacao,
    salvarAvaliacao,
    resetarAvaliacao,
    todasAvaliacoesCompletas
  } = useAvaliacaoInstitucional(questionarioId);

  const bgHeader = useColorModeValue('blue.600', 'blue.700');
  const bgCard = useColorModeValue('white', 'gray.800');
  const bgDisciplina = useColorModeValue('blue.50', 'blue.900');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleSalvarAvaliacao = async () => {
    if (!todasAvaliacoesCompletas()) {
      toast({
        title: 'Avaliação incompleta',
        description: 'Por favor, complete todas as avaliações antes de salvar.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const result = await salvarAvaliacao();
    
    toast({
      title: result.success ? 'Sucesso!' : 'Erro',
      description: result.message,
      status: result.success ? 'success' : 'error',
      duration: 5000,
      isClosable: true,
    });
  };

  const handleResetarAvaliacao = () => {
    if (window.confirm('Tem certeza que deseja resetar todas as avaliações?')) {
      resetarAvaliacao();
      toast({
        title: 'Avaliações resetadas',
        description: 'Todas as avaliações foram limpas.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Text>Carregando avaliação institucional...</Text>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header Institucional */}
      <Box bg="blue.800" color="white" py={8}>
        <Container maxW="6xl">
          <HStack spacing={4} align="center" mb={6}>
            <Icon as={FaGraduationCap} boxSize={8} />
            <VStack align="start" spacing={1}>
              <Heading size="xl" fontWeight="bold">Avaliação Institucional</Heading>
              <Text fontSize="lg" opacity={0.9}>Católica SC - 2024.1</Text>
            </VStack>
          </HStack>

          {/* Barra de Progresso */}
          <VStack align="start" spacing={3}>
            <HStack justify="space-between" w="full">
              <Text fontSize="md" fontWeight="medium">Progresso</Text>
              <Text fontSize="md" fontWeight="medium">Progresso: {secoesCompletas} de {totalSecoes} seções</Text>
            </HStack>
            <Progress 
              value={progresso} 
              size="lg" 
              w="full" 
              colorScheme="green"
              borderRadius="full"
              bg="blue.700"
            />
          </VStack>
        </Container>
      </Box>

      <Container maxW="6xl" py={8}>
        <VStack spacing={6} align="stretch">
          {/* Alert de erro */}
          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}

          {/* Seção Suas Disciplinas */}
          <Card bg="blue.100" border="1px solid" borderColor="blue.300" borderRadius="lg">
            <CardBody p={6}>
              <HStack spacing={4} mb={4}>
                <Icon as={FaFileAlt} color="blue.600" boxSize={6} />
                <Heading size="lg" color="blue.800" fontWeight="bold">Suas Disciplinas</Heading>
              </HStack>
              <Text color="blue.700" fontSize="md">
                Você está matriculado em <Text as="span" fontWeight="bold" color="blue.800">{disciplinas.length} disciplinas</Text>. 
                Para cada disciplina, avalie os aspectos listados abaixo.
              </Text>
            </CardBody>
          </Card>

          {/* Avaliação das Disciplinas */}
          <Card bg="blue.100" border="1px solid" borderColor="blue.300" borderRadius="lg" shadow="md">
            <CardBody p={6}>
              <HStack spacing={4} mb={6}>
                <Icon as={FaChartBar} color="blue.600" boxSize={6} />
                <Heading size="lg" color="blue.800" fontWeight="bold">Avaliação das Disciplinas</Heading>
              </HStack>
              
              <Text mb={8} color="blue.700" fontSize="md">
                Para cada disciplina, indique o grau de concordância com as seguintes afirmações:
              </Text>

              <VStack spacing={6} align="stretch">
                {disciplinas.map((disciplina, index) => (
                  <Box key={disciplina.id} bg="white" borderRadius="lg" border="1px solid" borderColor="blue.200" overflow="hidden">
                    {/* Cabeçalho da Disciplina */}
                    <Box bg="blue.800" color="white" p={4}>
                      <HStack spacing={3} justify="space-between">
                        <HStack spacing={3}>
                          <Icon as={FaChartBar} boxSize={5} />
                          <Text fontWeight="bold" fontSize="lg">{disciplina.nome}</Text>
                        </HStack>
                        <Badge 
                          colorScheme={disciplina.avaliacoes.every(av => av.valor !== null) ? 'green' : 'yellow'}
                          size="md"
                          bg={disciplina.avaliacoes.every(av => av.valor !== null) ? 'green.500' : 'yellow.500'}
                        >
                          {disciplina.avaliacoes.every(av => av.valor !== null) ? 'Completa' : 'Pendente'}
                        </Badge>
                      </HStack>
                    </Box>

                    {/* Tabela de Avaliação */}
                    <Box p={4}>
                      <Box overflowX="auto">
                        <Table variant="simple" size="md">
                          <Thead>
                            <Tr bg="blue.50">
                              <Th fontWeight="bold" color="blue.800" fontSize="md">Aspectos</Th>
                              {opcoesAvaliacao.map(opcao => (
                                <Th key={opcao.valor} textAlign="center" fontWeight="bold" color="blue.800">
                                  <VStack spacing={2}>
                                    <Text fontSize="sm">{opcao.label}</Text>
                                    <Box w={4} h={4} borderRadius="full" bg="blue.200" />
                                  </VStack>
                                </Th>
                              ))}
                            </Tr>
                          </Thead>
                          <Tbody>
                            {disciplina.avaliacoes.map((avaliacao, avIndex) => (
                              <Tr key={avIndex} _hover={{ bg: "gray.50" }}>
                                <Td fontWeight="medium" py={3}>{avaliacao.criterio}</Td>
                                {opcoesAvaliacao.map(opcao => (
                                  <Td key={opcao.valor} textAlign="center" py={3}>
                                    <Radio
                                      value={opcao.valor.toString()}
                                      isChecked={avaliacao.valor === opcao.valor}
                                      onChange={() => atualizarAvaliacao(disciplina.id, avaliacao.criterio, opcao.valor)}
                                      colorScheme="blue"
                                      size="md"
                                    />
                                  </Td>
                                ))}
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </VStack>

              {/* Botões de ação */}
              <HStack justify="center" spacing={4} mt={8}>
                <Button
                  leftIcon={<FaUndo />}
                  colorScheme="gray"
                  variant="outline"
                  onClick={handleResetarAvaliacao}
                  isDisabled={loading}
                >
                  Resetar
                </Button>
                
                <Button
                  leftIcon={<FaSave />}
                  colorScheme="green"
                  size="lg"
                  onClick={handleSalvarAvaliacao}
                  isDisabled={loading || !todasAvaliacoesCompletas()}
                  px={8}
                  py={3}
                >
                  {loading ? 'Salvando...' : 'Salvar Avaliação'}
                </Button>
              </HStack>

              {/* Status da avaliação */}
              <Box textAlign="center" mt={4}>
                <Text fontSize="sm" color="gray.500">
                  {todasAvaliacoesCompletas() 
                    ? '✅ Todas as avaliações estão completas!' 
                    : `⚠️ Complete todas as avaliações para salvar (${Math.round(progresso)}%)`
                  }
                </Text>
              </Box>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};
