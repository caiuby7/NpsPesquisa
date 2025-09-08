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
      {/* Header */}
      <Box bg={bgHeader} color="white" py={6}>
        <Container maxW="6xl">
          <HStack spacing={4} align="center" mb={4}>
            <Icon as={FaGraduationCap} boxSize={6} />
            <VStack align="start" spacing={1}>
              <Heading size="lg">Avaliação Institucional</Heading>
              <Text fontSize="md" opacity={0.9}>Católica SC - 2024.1</Text>
            </VStack>
          </HStack>

          {/* Progresso */}
          <VStack align="start" spacing={2}>
            <HStack justify="space-between" w="full">
              <Text fontSize="sm">Progresso</Text>
              <Text fontSize="sm">{secoesCompletas} de {totalSecoes} seções</Text>
            </HStack>
            <Progress 
              value={progresso} 
              size="sm" 
              w="full" 
              colorScheme="green"
              borderRadius="full"
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
          <Card bg="blue.50" border="1px solid" borderColor="blue.200">
            <CardBody>
              <HStack spacing={3} mb={3}>
                <Icon as={FaFileAlt} color="green.500" boxSize={5} />
                <Heading size="md" color="blue.800">Suas Disciplinas</Heading>
              </HStack>
              <Text color="blue.700">
                Você está matriculado em <Badge colorScheme="blue" fontSize="md">{disciplinas.length} disciplinas</Badge>. 
                Para cada disciplina, avalie os aspectos listados abaixo.
              </Text>
            </CardBody>
          </Card>

          {/* Avaliação das Disciplinas */}
          <Card bg={bgCard} shadow="md">
            <CardBody>
              <HStack spacing={3} mb={6}>
                <Icon as={FaChartBar} color="green.500" boxSize={5} />
                <Heading size="md">Avaliação das Disciplinas</Heading>
              </HStack>
              
              <Text mb={6} color="gray.600">
                Para cada disciplina, indique o grau de concordância com as seguintes afirmações:
              </Text>

              <Accordion allowMultiple defaultIndex={[0]}>
                {disciplinas.map((disciplina, index) => (
                  <AccordionItem key={disciplina.id} border="1px solid" borderColor={borderColor} mb={4}>
                    <AccordionButton 
                      bg={bgDisciplina} 
                      _hover={{ bg: useColorModeValue('blue.100', 'blue.800') }}
                      py={4}
                    >
                      <HStack flex="1" justify="space-between">
                        <HStack spacing={3}>
                          <Icon as={FaCheckSquare} color="white" boxSize={4} />
                          <Text fontWeight="semibold" color="blue.800">
                            {disciplina.nome}
                          </Text>
                          <Badge 
                            colorScheme={disciplina.avaliacoes.every(av => av.valor !== null) ? 'green' : 'yellow'}
                            size="sm"
                          >
                            {disciplina.avaliacoes.every(av => av.valor !== null) ? 'Completa' : 'Pendente'}
                          </Badge>
                        </HStack>
                        <Icon as={index === 0 ? FaChevronDown : FaChevronRight} color="blue.800" />
                      </HStack>
                    </AccordionButton>

                    <AccordionPanel pb={4}>
                      <Box overflowX="auto">
                        <Table variant="simple" size="sm">
                          <Thead>
                            <Tr>
                              <Th>Aspectos</Th>
                              {opcoesAvaliacao.map(opcao => (
                                <Th key={opcao.valor} textAlign="center">
                                  <VStack spacing={1}>
                                    <Text fontSize="xs">{opcao.label}</Text>
                                    <Badge colorScheme={opcao.cor} size="sm">
                                      {opcao.valor}
                                    </Badge>
                                  </VStack>
                                </Th>
                              ))}
                            </Tr>
                          </Thead>
                          <Tbody>
                            {disciplina.avaliacoes.map((avaliacao, avIndex) => (
                              <Tr key={avIndex}>
                                <Td fontWeight="medium">{avaliacao.criterio}</Td>
                                {opcoesAvaliacao.map(opcao => (
                                  <Td key={opcao.valor} textAlign="center">
                                    <Radio
                                      value={opcao.valor.toString()}
                                      isChecked={avaliacao.valor === opcao.valor}
                                      onChange={() => atualizarAvaliacao(disciplina.id, avaliacao.criterio, opcao.valor)}
                                      colorScheme={opcao.cor}
                                    />
                                  </Td>
                                ))}
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>

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
