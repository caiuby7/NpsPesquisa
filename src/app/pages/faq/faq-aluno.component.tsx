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
  GraduationCap,
  MessageSquare,
  Clock,
  Target
} from 'lucide-react';
import MainLayout from '../../../components/layout/main-layout.component';

const FAQAlunoPage: React.FC = () => {
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
      title: 'Como Funciona o Sistema',
      icon: HelpCircle,
      color: 'blue',
      content: (
        <VStack spacing={6} align="stretch">
          <Alert status="info">
            <AlertIcon />
            <AlertTitle>Bem-vindo ao Sistema de Avaliação!</AlertTitle>
            <AlertDescription>
              Aqui você pode avaliar professores, disciplinas e outros aspectos da sua experiência acadêmica.
            </AlertDescription>
          </Alert>

          <Box>
            <Heading size="md" mb={4} color="blue.600">
              <Icon as={GraduationCap} mr={2} />
              O que é o Sistema de Avaliação?
            </Heading>
            <Text mb={4}>
              O Sistema de Avaliação Institucional é uma ferramenta que permite aos alunos 
              avaliarem professores, disciplinas e outros aspectos da vida acadêmica, 
              contribuindo para a melhoria contínua da qualidade de ensino.
            </Text>
            
            <List spacing={3}>
              <ListItem>
                <ListIcon as={CheckCircle} color="green.500" />
                <Text as="span" fontWeight="semibold">Avaliações de Professores:</Text> Avalie a qualidade do ensino, metodologia e didática dos seus professores.
              </ListItem>
              <ListItem>
                <ListIcon as={CheckCircle} color="green.500" />
                <Text as="span" fontWeight="semibold">Avaliações de Disciplinas:</Text> Opine sobre o conteúdo, relevância e estrutura das disciplinas.
              </ListItem>
              <ListItem>
                <ListIcon as={CheckCircle} color="green.500" />
                <Text as="span" fontWeight="semibold">Avaliações Institucionais:</Text> Contribua com sugestões para melhorar a instituição.
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
              Passo a Passo para Responder
            </Heading>
            
            <List spacing={4}>
              <ListItem>
                <HStack align="start">
                  <Badge colorScheme="green" borderRadius="full" w={6} h={6} display="flex" alignItems="center" justifyContent="center">1</Badge>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="semibold">Acesse seu Dashboard</Text>
                    <Text fontSize="sm" color="gray.600">Clique em "Meu Dashboard" para ver suas avaliações pendentes.</Text>
                  </VStack>
                </HStack>
              </ListItem>
              
              <ListItem>
                <HStack align="start">
                  <Badge colorScheme="green" borderRadius="full" w={6} h={6} display="flex" alignItems="center" justifyContent="center">2</Badge>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="semibold">Escolha uma Avaliação</Text>
                    <Text fontSize="sm" color="gray.600">Clique em "Responder Questionário" na avaliação que deseja responder.</Text>
                  </VStack>
                </HStack>
              </ListItem>
              
              <ListItem>
                <HStack align="start">
                  <Badge colorScheme="green" borderRadius="full" w={6} h={6} display="flex" alignItems="center" justifyContent="center">3</Badge>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="semibold">Responda as Questões</Text>
                    <Text fontSize="sm" color="gray.600">Leia cada pergunta com atenção e selecione a resposta mais adequada.</Text>
                  </VStack>
                </HStack>
              </ListItem>
              
              <ListItem>
                <HStack align="start">
                  <Badge colorScheme="green" borderRadius="full" w={6} h={6} display="flex" alignItems="center" justifyContent="center">4</Badge>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="semibold">Finalize e Envie</Text>
                    <Text fontSize="sm" color="gray.600">Revise suas respostas e clique em "Enviar Avaliação".</Text>
                  </VStack>
                </HStack>
              </ListItem>
            </List>
          </Box>

          <Alert status="warning">
            <AlertIcon />
            <AlertTitle>Atenção!</AlertTitle>
            <AlertDescription>
              Após enviar uma avaliação, você não poderá mais alterá-la. Certifique-se de que suas respostas estão corretas antes de finalizar.
            </AlertDescription>
          </Alert>
        </VStack>
      )
    },
    {
      id: 'tipos-questoes',
      title: 'Tipos de Questões',
      icon: Target,
      color: 'purple',
      content: (
        <VStack spacing={6} align="stretch">
          <Box>
            <Heading size="md" mb={4} color="purple.600">
              <Icon as={Target} mr={2} />
              Conhecendo os Tipos de Questões
            </Heading>
            
            <VStack spacing={4} align="stretch">
              <Box p={4} bg="gray.50" borderRadius="md" borderLeft="4px solid" borderLeftColor="blue.500">
                <Heading size="sm" mb={2} color="blue.600">Questões de Múltipla Escolha</Heading>
                <Text fontSize="sm" mb={2}>Selecione uma única opção entre as alternativas apresentadas.</Text>
                <Code fontSize="xs" p={2} bg="blue.50" borderRadius="md">
                  Exemplo: ⭕ Excelente ⭕ Bom ⭕ Regular ⭕ Ruim
                </Code>
              </Box>
              
              <Box p={4} bg="gray.50" borderRadius="md" borderLeft="4px solid" borderLeftColor="green.500">
                <Heading size="sm" mb={2} color="green.600">Questões de Escala</Heading>
                <Text fontSize="sm" mb={2}>Avalie em uma escala numérica de 1 a 10.</Text>
                <Code fontSize="xs" p={2} bg="green.50" borderRadius="md">
                  Exemplo: 1 (Muito Ruim) ←→ 10 (Excelente)
                </Code>
              </Box>
              
              <Box p={4} bg="gray.50" borderRadius="md" borderLeft="4px solid" borderLeftColor="purple.500">
                <Heading size="sm" mb={2} color="purple.600">Questões de Texto</Heading>
                <Text fontSize="sm" mb={2}>Escreva sua opinião ou sugestão em texto livre.</Text>
                <Code fontSize="xs" p={2} bg="purple.50" borderRadius="md">
                  Exemplo: "Gostaria de sugerir que..."
                </Code>
              </Box>
            </VStack>
          </Box>

          <Alert status="info">
            <AlertIcon />
            <AlertTitle>Dica Importante</AlertTitle>
            <AlertDescription>
              Seja honesto e construtivo em suas avaliações. Sua opinião é fundamental para a melhoria da qualidade de ensino.
            </AlertDescription>
          </Alert>
        </VStack>
      )
    },
    {
      id: 'prazo-avaliacoes',
      title: 'Prazos e Disponibilidade',
      icon: Clock,
      color: 'orange',
      content: (
        <VStack spacing={6} align="stretch">
          <Box>
            <Heading size="md" mb={4} color="orange.600">
              <Icon as={Clock} mr={2} />
              Prazos das Avaliações
            </Heading>
            
            <VStack spacing={4} align="stretch">
              <Box p={4} bg="orange.50" borderRadius="md" border="1px solid" borderColor="orange.200">
                <HStack mb={2}>
                  <Icon as={Clock} color="orange.500" />
                  <Text fontWeight="semibold" color="orange.700">Período de Avaliação</Text>
                </HStack>
                <Text fontSize="sm" color="orange.600">
                  Cada avaliação tem um período específico para ser respondida. 
                  Verifique as datas de início e fim no seu dashboard.
                </Text>
              </Box>
              
              <List spacing={3}>
                <ListItem>
                  <ListIcon as={CheckCircle} color="green.500" />
                  <Text as="span" fontWeight="semibold">Avaliações Disponíveis:</Text> Aparecem em verde no seu dashboard.
                </ListItem>
                <ListItem>
                  <ListIcon as={Clock} color="orange.500" />
                  <Text as="span" fontWeight="semibold">Avaliações Pendentes:</Text> Você tem tempo para responder.
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircle} color="blue.500" />
                  <Text as="span" fontWeight="semibold">Avaliações Respondidas:</Text> Já foram enviadas com sucesso.
                </ListItem>
                <ListItem>
                  <ListIcon as={Clock} color="red.500" />
                  <Text as="span" fontWeight="semibold">Avaliações Expiradas:</Text> O prazo já passou.
                </ListItem>
              </List>
            </VStack>
          </Box>

          <Alert status="warning">
            <AlertIcon />
            <AlertTitle>Lembrete Importante</AlertTitle>
            <AlertDescription>
              Não deixe para a última hora! Avaliações expiradas não podem ser respondidas posteriormente.
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
              Perguntas Mais Comuns
            </Heading>
            
            <VStack spacing={4} align="stretch">
              <Box p={4} bg="teal.50" borderRadius="md" border="1px solid" borderColor="teal.200">
                <Text fontWeight="semibold" color="teal.700" mb={2}>
                  Posso alterar uma avaliação depois de enviada?
                </Text>
                <Text fontSize="sm" color="teal.600">
                  Não, após enviar uma avaliação ela não pode ser alterada. Por isso, revise bem suas respostas antes de finalizar.
                </Text>
              </Box>
              
              <Box p={4} bg="teal.50" borderRadius="md" border="1px solid" borderColor="teal.200">
                <Text fontWeight="semibold" color="teal.700" mb={2}>
                  Minhas avaliações são anônimas?
                </Text>
                <Text fontSize="sm" color="teal.600">
                  Sim, suas avaliações são tratadas de forma confidencial e anônima para garantir sua liberdade de expressão.
                </Text>
              </Box>
              
              <Box p={4} bg="teal.50" borderRadius="md" border="1px solid" borderColor="teal.200">
                <Text fontWeight="semibold" color="teal.700" mb={2}>
                  O que acontece se eu não responder uma avaliação?
                </Text>
                <Text fontSize="sm" color="teal.600">
                  Avaliações não respondidas no prazo não podem ser respondidas posteriormente. É importante participar para contribuir com a melhoria da qualidade.
                </Text>
              </Box>
              
              <Box p={4} bg="teal.50" borderRadius="md" border="1px solid" borderColor="teal.200">
                <Text fontWeight="semibold" color="teal.700" mb={2}>
                  Como posso ver meu histórico de avaliações?
                </Text>
                <Text fontSize="sm" color="teal.600">
                  Acesse "Meu Histórico" no menu para ver todas as avaliações que você já respondeu.
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
                <Icon as={GraduationCap} w={8} h={8} color="blue.500" />
                <Heading size="xl" color="blue.600">
                  Manual do Aluno
                </Heading>
              </HStack>
              <Text fontSize="lg" color="gray.600" maxW="2xl" mx="auto">
                Guia completo para alunos sobre como usar o Sistema de Avaliação Institucional. 
                Aprenda a avaliar professores e disciplinas de forma eficiente.
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
                Sistema de Avaliação Institucional - Manual do Aluno v1.0
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

export default FAQAlunoPage;
