import React from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Progress,
  Card,
  CardHeader,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Radio,
  RadioGroup,
  Stack,
  Button,
  Alert,
  AlertIcon,
  Badge,
  useColorModeValue,
  Divider,
  Flex,
  Icon
} from '@chakra-ui/react';
import { FiBook, FiDatabase, FiGlobe, FiSmartphone, FiShield, FiCpu, FiBarChart2 } from 'react-icons/fi';

interface Discipline {
  id: string;
  name: string;
  icon: string;
  aspects: string[];
}

interface EvaluationData {
  disciplineId: string;
  aspectId: string;
  value: string;
}

interface InstitutionalEvaluationLayoutProps {
  title: string;
  subtitle: string;
  progress: number;
  totalSections: number;
  currentSection: number;
  disciplines: Discipline[];
  evaluationData: EvaluationData[];
  onEvaluationChange: (disciplineId: string, aspectId: string, value: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  isNextDisabled?: boolean;
  participantType?: string;
}

const InstitutionalEvaluationLayout: React.FC<InstitutionalEvaluationLayoutProps> = ({
  title,
  subtitle,
  progress,
  totalSections,
  currentSection,
  disciplines,
  evaluationData,
  onEvaluationChange,
  onPrevious,
  onNext,
  isNextDisabled = false,
  participantType
}) => {
  const bgGradient = useColorModeValue(
    'linear(to-r, blue.500, blue.600)',
    'linear(to-r, blue.400, blue.500)'
  );
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('blue.500', 'blue.600');
  const infoBg = useColorModeValue('blue.50', 'blue.900');
  const infoBorder = useColorModeValue('blue.200', 'blue.700');

  const evaluationOptions = [
    { value: '5', label: 'Excelente' },
    { value: '4', label: 'Bom' },
    { value: '3', label: 'Regular' },
    { value: '2', label: 'Ruim' },
    { value: '1', label: 'Muito Ruim' }
  ];

  const getEvaluationValue = (disciplineId: string, aspectId: string) => {
    const evaluation = evaluationData.find(
      e => e.disciplineId === disciplineId && e.aspectId === aspectId
    );
    return evaluation?.value || '';
  };

  const getDisciplineIcon = (iconName: string) => {
    const icons: { [key: string]: React.ElementType } = {
      'book': FiBook,
      'database': FiDatabase,
      'globe': FiGlobe,
      'smartphone': FiSmartphone,
      'shield': FiShield,
      'cpu': FiCpu,
      'bar-chart': FiBarChart2
    };
    return icons[iconName] || FiBook;
  };

  return (
    <Container maxW="1200px" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box
          bgGradient={bgGradient}
          color="white"
          p={8}
          borderRadius="lg"
          textAlign="center"
          boxShadow="lg"
        >
          <Heading size="xl" mb={2}>
            🎓 {title}
          </Heading>
          <Text fontSize="lg" opacity={0.9}>
            {subtitle}
          </Text>
        </Box>

        {/* Progress Bar */}
        <Box>
          <Progress
            value={progress}
            size="sm"
            colorScheme="green"
            borderRadius="full"
            bg="gray.200"
          />
          <Text textAlign="center" color="gray.600" mt={2}>
            Progresso: {currentSection} de {totalSections} seções
          </Text>
        </Box>

        {/* Info Box */}
        <Alert status="info" borderRadius="md" bg={infoBg} borderColor={infoBorder}>
          <AlertIcon />
          <Box>
            <Text fontWeight="bold" mb={1}>
              📚 Suas Disciplinas
            </Text>
            <Text>
              {participantType === "Professor" ? (
                <>
                  Você leciona <Text as="span" fontWeight="bold" bg="yellow.300" px={2} py={1} borderRadius="md">{disciplines.length} {disciplines.length === 1 ? 'disciplina' : 'disciplinas'}</Text>. 
                  Para cada disciplina, avalie os aspectos listados abaixo.
                </>
              ) : (
                <>
                  Você está matriculado em <Text as="span" fontWeight="bold" bg="yellow.300" px={2} py={1} borderRadius="md">{disciplines.length} {disciplines.length === 1 ? 'disciplina' : 'disciplinas'}</Text>. 
                  Para cada disciplina, avalie os aspectos listados abaixo.
                </>
              )}
            </Text>
          </Box>
        </Alert>

        {/* Question Section */}
        <Card bg={cardBg} borderRadius="lg" boxShadow="md">
          <CardHeader>
            <Heading size="md" color="blue.500" borderBottom="2px solid" borderColor="blue.100" pb={2}>
              📊 Avaliação das Disciplinas
            </Heading>
            <Text color="gray.600" mt={2}>
              Para cada disciplina, indique o grau de concordância com as seguintes afirmações:
            </Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={6} align="stretch">
              {disciplines.map((discipline) => {
                const IconComponent = getDisciplineIcon(discipline.icon);
                
                return (
                  <Card key={discipline.id} bg="gray.50" borderColor={borderColor}>
                    <CardHeader bg={headerBg} color="white" borderRadius="md" mb={0}>
                      <HStack>
                        <Icon as={IconComponent} boxSize={5} />
                        <Text fontWeight="bold" fontSize="lg">
                          {discipline.name}
                        </Text>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <Box overflowX="auto">
                        <Table size="sm" variant="simple">
                          <Thead>
                            <Tr>
                              <Th width="200px" bg="gray.100" fontWeight="bold">
                                Aspectos
                              </Th>
                              {evaluationOptions.map((option) => (
                                <Th key={option.value} textAlign="center" bg="gray.100">
                                  <VStack spacing={1}>
                                    <Radio
                                      value={option.value}
                                      size="sm"
                                      colorScheme="blue"
                                    />
                                    <Text fontSize="xs" textAlign="center" lineHeight="short">
                                      {option.label}
                                    </Text>
                                  </VStack>
                                </Th>
                              ))}
                            </Tr>
                          </Thead>
                          <Tbody>
                            {discipline.aspects.map((aspect, aspectIndex) => (
                              <Tr key={aspectIndex}>
                                <Td fontWeight="medium" bg="gray.50">
                                  {aspect}
                                </Td>
                                {evaluationOptions.map((option) => (
                                  <Td key={option.value} textAlign="center">
                                    <Radio
                                      value={option.value}
                                      isChecked={getEvaluationValue(discipline.id, aspect) === option.value}
                                      onChange={() => onEvaluationChange(discipline.id, aspect, option.value)}
                                      colorScheme="blue"
                                    />
                                  </Td>
                                ))}
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                    </CardBody>
                  </Card>
                );
              })}
            </VStack>

            {/* Navigation */}
            <Divider my={6} />
            <Flex justify="space-between" align="center">
              <Button
                colorScheme="gray"
                variant="outline"
                onClick={onPrevious}
                leftIcon={<Text>←</Text>}
              >
                Anterior
              </Button>
              <Button
                colorScheme="blue"
                onClick={onNext}
                rightIcon={<Text>→</Text>}
                isDisabled={isNextDisabled}
              >
                Próximo
              </Button>
            </Flex>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default InstitutionalEvaluationLayout;
