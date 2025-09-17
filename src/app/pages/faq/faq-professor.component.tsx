import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Badge,
  Divider,
  Image,
  List,
  ListItem,
  ListIcon,
  Code,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  Icon,
  Flex
} from '@chakra-ui/react';
import {
  BookOpen,
  Users,
  FileText,
  Settings,
  BarChart3,
  HelpCircle,
  ChevronRight,
  CheckCircle,
  Info,
  Lightbulb,
  UserCheck,
  MessageSquare,
  Clock,
  Target,
  TrendingUp,
  BookOpen as BookIcon
} from 'lucide-react';
import MainLayout from '../../../components/layout/main-layout.component';

const FAQProfessorPage: React.FC = () => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleToggle = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const sections = [
    {
      id: 'como-funciona',
      title: 'Como Funciona o Sistema para Professores',
      icon: UserCheck,
      color: 'blue',
      content: (
        <VStack spacing={6} align="stretch">
          <Alert status="info">
            <AlertIcon />
            <AlertTitle>Bem-vindo ao Sistema de Avaliação!</AlertTitle>
            <AlertDescription>
              Como professor, você pode ser avaliado pelos alunos e também responder avaliações institucionais.
            </AlertDescription>
          </Alert>

          <Box>
            <Heading size="md" mb={4} color="blue.600">
              <Icon as={UserCheck} mr={2} />
              O que é o Sistema de Avaliação?
            </Heading>
            <Text mb={4}>
              O Sistema de Avaliação Institucional permite que os alunos avaliem professores e disciplinas, 
              fornecendo feedback valioso para o aprimoramento do ensino. Como professor, você também pode 
              participar de avaliações institucionais.
            </Text>
            
            <List spacing={3}>
              <ListItem>
                <ListIcon as={CheckCircle} color="green.500" />
                <Text as="span" fontWeight="semibold">Avaliações Recebidas:</Text> Os alunos avaliam sua performance como professor.
              </ListItem>
              <ListItem>
                <ListIcon as={CheckCircle} color="green.500" />
                <Text as="span" fontWeight="semibold">Avaliações de Disciplinas:</Text> Feedback sobre o conteúdo e metodologia das disciplinas.
              </ListItem>
              <ListItem>
                <ListIcon as={CheckCircle} color="green.500" />
                <Text as="span" fontWeight="semibold">Avaliações Institucionais:</Text> Sua opinião sobre aspectos da instituição.
              </ListItem>
            </List>
          </Box>
        </VStack>
      )
    },
    {
      id: 'responder-avaliacoes',
      title: 'Como Responder Avaliações',
      icon: MessageSquare,
      color: 'green',
      content: (
        <VStack spacing={6} align="stretch">
          <Box>
            <Heading size="md" mb={4} color="green.600">
              <Icon as={MessageSquare} mr={2} />
              Passo a Passo para Professores
            </Heading>
            
            <List spacing={4}>
              <ListItem>
                <HStack align="start">
                  <Badge colorScheme="green" borderRadius="full" w={6} h={6} display="flex" alignItems="center" justifyContent="center">1</Badge>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="semibold">Acesse seu Dashboard</Text>
                    <Text fontSize="sm" color="gray.600">Clique em "Meu Dashboard" para ver avaliações disponíveis.</Text>
                  </VStack>
                </HStack>
              </ListItem>
              
              <ListItem>
                <HStack align="start">
                  <Badge colorScheme="green" borderRadius="full" w={6} h={6} display="flex" alignItems="center" justifyContent="center">2</Badge>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="semibold">Escolha uma Avaliação</Text>
                    <Text fontSize="sm" color="gray.600">Selecione a avaliação institucional que deseja responder.</Text>
                  </VStack>
                </HStack>
              </ListItem>
              
              <ListItem>
                <HStack align="start">
                  <Badge colorScheme="green" borderRadius="full" w={6} h={6} display="flex" alignItems="center" justifyContent="center">3</Badge>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="semibold">Responda com Honestidade</Text>
                    <Text fontSize="sm" color="gray.600">Seja sincero em suas respostas para contribuir com a melhoria institucional.</Text>
                  </VStack>
                </HStack>
              </ListItem>
              
              <ListItem>
                <HStack align="start">
                  <Badge colorScheme="green" borderRadius="full" w={6} h={6} display="flex" alignItems="center" justifyContent="center">4</Badge>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="semibold">Finalize e Envie</Text>
                    <Text fontSize="sm" color="gray.600">Revise suas respostas e envie a avaliação.</Text>
                  </VStack>
                </HStack>
              </ListItem>
            </List>
          </Box>

          <Alert status="info">
            <AlertIcon />
            <AlertTitle>Importante para Professores</AlertTitle>
            <AlertDescription>
              Suas avaliações institucionais são fundamentais para o planejamento e melhoria da qualidade de ensino.
            </AlertDescription>
          </Alert>
        </VStack>
      )
    },
    {
      id: 'feedback-alunos',
      title: 'Entendendo o Feedback dos Alunos',
      icon: TrendingUp,
      color: 'purple',
      content: (
        <VStack spacing={6} align="stretch">
          <Box>
            <Heading size="md" mb={4} color="purple.600">
              <Icon as={TrendingUp} mr={2} />
              Como Interpretar as Avaliações dos Alunos
            </Heading>
            
            <VStack spacing={4} align="stretch">
              <Box p={4} bg="purple.50" borderRadius="md" borderLeft="4px solid" borderLeftColor="purple.500">
                <Heading size="sm" mb={2} color="purple.600">Aspectos Avaliados</Heading>
                <List spacing={2} fontSize="sm">
                  <ListItem>• Qualidade do ensino e didática</ListItem>
                  <ListItem>• Metodologia de ensino</ListItem>
                  <ListItem>• Relacionamento com os alunos</ListItem>
                  <ListItem>• Organização e planejamento das aulas</ListItem>
                  <ListItem>• Disponibilidade para esclarecimentos</ListItem>
                </List>
              </Box>
              
              <Box p={4} bg="blue.50" borderRadius="md" borderLeft="4px solid" borderLeftColor="blue.500">
                <Heading size="sm" mb={2} color="blue.600">Como Usar o Feedback</Heading>
                <Text fontSize="sm" mb={2}>
                  As avaliações dos alunos são uma ferramenta valiosa para:
                </Text>
                <List spacing={1} fontSize="sm">
                  <ListItem>• Identificar pontos fortes e áreas de melhoria</ListItem>
                  <ListItem>• Ajustar metodologias de ensino</ListItem>
                  <ListItem>• Melhorar a comunicação com os alunos</ListItem>
                  <ListItem>• Desenvolver competências pedagógicas</ListItem>
                </List>
              </Box>
            </VStack>
          </Box>

          <Alert status="info">
            <AlertIcon />
            <AlertTitle>Perspectiva Positiva</AlertTitle>
            <AlertDescription>
              Veja as avaliações como oportunidades de crescimento profissional e melhoria contínua do seu ensino.
            </AlertDescription>
          </Alert>
        </VStack>
      )
    },
    {
      id: 'relatorios',
      title: 'Acessando Relatórios',
      icon: BarChart3,
      color: 'orange',
      content: (
        <VStack spacing={6} align="stretch">
          <Box>
            <Heading size="md" mb={4} color="orange.600">
              <Icon as={BarChart3} mr={2} />
              Como Visualizar seus Resultados
            </Heading>
            
            <VStack spacing={4} align="stretch">
              <Box p={4} bg="orange.50" borderRadius="md" border="1px solid" borderColor="orange.200">
                <HStack mb={2}>
                  <Icon as={BarChart3} color="orange.500" />
                  <Text fontWeight="semibold" color="orange.700">Meu Histórico</Text>
                </HStack>
                <Text fontSize="sm" color="orange.600">
                  Acesse "Meu Histórico" para ver todas as avaliações que você respondeu e os resultados das avaliações dos alunos.
                </Text>
              </Box>
              
              <List spacing={3}>
                <ListItem>
                  <ListIcon as={CheckCircle} color="green.500" />
                  <Text as="span" fontWeight="semibold">Avaliações Respondidas:</Text> Veja seu histórico de participação.
                </ListItem>
                <ListItem>
                  <ListIcon as={TrendingUp} color="blue.500" />
                  <Text as="span" fontWeight="semibold">Feedback dos Alunos:</Text> Consulte as avaliações recebidas dos alunos.
                </ListItem>
                <ListItem>
                  <ListIcon as={BookIcon} color="purple.500" />
                  <Text as="span" fontWeight="semibold">Relatórios de Disciplina:</Text> Acompanhe o feedback sobre suas disciplinas.
                </ListItem>
              </List>
            </VStack>
          </Box>

          <Alert status="info">
            <AlertIcon />
            <AlertTitle>Dica Importante</AlertTitle>
            <AlertDescription>
              Consulte regularmente seus relatórios para acompanhar sua evolução como professor e identificar oportunidades de melhoria.
            </AlertDescription>
          </Alert>
        </VStack>
      )
    },
    {
      id: 'duvidas-frequentes',
      title: 'Dúvidas Frequentes',
      icon: HelpCircle,
      color: 'teal',
      content: (
        <VStack spacing={6} align="stretch">
          <Box>
            <Heading size="md" mb={4} color="teal.600">
              <Icon as={HelpCircle} mr={2} />
              Perguntas Mais Comuns dos Professores
            </Heading>
            
            <VStack spacing={4} align="stretch">
              <Box p={4} bg="teal.50" borderRadius="md" border="1px solid" borderColor="teal.200">
                <Text fontWeight="semibold" color="teal.700" mb={2}>
                  Posso ver quem me avaliou?
                </Text>
                <Text fontSize="sm" color="teal.600">
                  Não, as avaliações dos alunos são anônimas para garantir a liberdade de expressão e feedback honesto.
                </Text>
              </Box>
              
              <Box p={4} bg="teal.50" borderRadius="md" border="1px solid" borderColor="teal.200">
                <Text fontWeight="semibold" color="teal.700" mb={2}>
                  Com que frequência sou avaliado pelos alunos?
                </Text>
                <Text fontSize="sm" color="teal.600">
                  As avaliações são realizadas conforme o calendário acadêmico, geralmente ao final de cada período letivo ou disciplina.
                </Text>
              </Box>
              
              <Box p={4} bg="teal.50" borderRadius="md" border="1px solid" borderColor="teal.200">
                <Text fontWeight="semibold" color="teal.700" mb={2}>
                  Como posso melhorar minhas avaliações?
                </Text>
                <Text fontSize="sm" color="teal.600">
                  Analise o feedback recebido, participe de formações pedagógicas e busque constantemente aprimorar sua metodologia de ensino.
                </Text>
              </Box>
              
              <Box p={4} bg="teal.50" borderRadius="md" border="1px solid" borderColor="teal.200">
                <Text fontWeight="semibold" color="teal.700" mb={2}>
                  Preciso responder todas as avaliações institucionais?
                </Text>
                <Text fontSize="sm" color="teal.600">
                  É altamente recomendado que participe das avaliações institucionais, pois sua opinião é valiosa para a melhoria da instituição.
                </Text>
              </Box>
              
              <Box p={4} bg="teal.50" borderRadius="md" border="1px solid" borderColor="teal.200">
                <Text fontWeight="semibold" color="teal.700" mb={2}>
                  Como acesso os relatórios das minhas avaliações?
                </Text>
                <Text fontSize="sm" color="teal.600">
                  Acesse "Meu Histórico" no menu para ver seus resultados e o feedback dos alunos sobre suas disciplinas.
                </Text>
              </Box>
            </VStack>
          </Box>
        </VStack>
      )
    }
  ];

  return (
    <MainLayout>
      <Box bg={bgColor} minH="100vh" py={8}>
        <Container maxW="4xl">
          <VStack spacing={8} align="stretch">
            {/* Header */}
            <Box textAlign="center">
              <HStack justify="center" mb={4}>
                <Icon as={UserCheck} w={8} h={8} color="green.500" />
                <Heading size="xl" color="green.600">
                  Manual do Professor
                </Heading>
              </HStack>
              <Text fontSize="lg" color="gray.600" maxW="2xl" mx="auto">
                Guia completo para professores sobre como usar o Sistema de Avaliação Institucional. 
                Aprenda a responder avaliações e interpretar o feedback dos alunos.
              </Text>
            </Box>

            {/* FAQ Content */}
            <Accordion allowMultiple>
              {sections.map((section) => (
                <AccordionItem key={section.id} bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="lg" mb={4}>
                  <AccordionButton p={6} _hover={{ bg: "gray.50" }}>
                    <HStack flex="1" textAlign="left">
                      <Icon as={section.icon} w={6} h={6} color={`${section.color}.500`} mr={4} />
                      <Heading size="md">{section.title}</Heading>
                    </HStack>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={6} px={6}>
                    {section.content}
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Footer */}
            <Box textAlign="center" py={8}>
              <Text color="gray.500" fontSize="sm">
                Sistema de Avaliação Institucional - Manual do Professor v1.0
              </Text>
              <Text color="gray.400" fontSize="xs" mt={2}>
                Para suporte técnico, entre em contato com a equipe de TI da instituição.
              </Text>
            </Box>
          </VStack>
        </Container>
      </Box>
    </MainLayout>
  );
};

export default FAQProfessorPage;
