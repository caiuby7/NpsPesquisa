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
  Lightbulb
} from 'lucide-react';
import MainLayout from '../../../components/layout/main-layout.component';

const FAQPage: React.FC = () => {
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
      id: 'overview',
      title: 'Visão Geral do Sistema',
      icon: BookOpen,
      color: 'blue',
      content: (
        <VStack spacing={4} align="stretch">
          <Text>
            O Sistema de Avaliação Institucional é uma plataforma completa para criação, 
            gerenciamento e análise de questionários de avaliação acadêmica.
          </Text>
          
          <Alert status="info">
            <AlertIcon />
            <Box>
              <AlertTitle>Objetivo Principal</AlertTitle>
              <AlertDescription>
                Permitir que instituições de ensino realizem avaliações sistemáticas 
                de professores, disciplinas, cursos e infraestrutura, coletando feedback 
                valioso para melhorias contínuas.
              </AlertDescription>
            </Box>
          </Alert>

          <Box>
            <Heading size="md" mb={3}>Principais Funcionalidades:</Heading>
            <List spacing={2}>
              <ListItem>
                <ListIcon as={CheckCircle} color="green.500" />
                Criação e gerenciamento de questionários
              </ListItem>
              <ListItem>
                <ListIcon as={CheckCircle} color="green.500" />
                Múltiplos tipos de questões (múltipla escolha, texto, escala linear, etc.)
              </ListItem>
              <ListItem>
                <ListIcon as={CheckCircle} color="green.500" />
                Questões condicionais dinâmicas
              </ListItem>
              <ListItem>
                <ListIcon as={CheckCircle} color="green.500" />
                Gestão de participantes
              </ListItem>
              <ListItem>
                <ListIcon as={CheckCircle} color="green.500" />
                Relatórios e análises estatísticas
              </ListItem>
            </List>
          </Box>
        </VStack>
      )
    },
    {
      id: 'questionarios',
      title: 'Gerenciamento de Questionários',
      icon: FileText,
      color: 'green',
      content: (
        <VStack spacing={6} align="stretch">
          <Box>
            <Heading size="md" mb={3}>Tela Principal de Questionários</Heading>
            <Text mb={4}>
              A tela principal exibe todos os questionários criados no sistema com opções 
              de filtro, busca e ações de gerenciamento.
            </Text>
            
            <Box p={4} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
              <Text fontWeight="bold" mb={2}>Funcionalidades Disponíveis:</Text>
              <List spacing={1} fontSize="sm">
                <ListItem>• <strong>Busca:</strong> Filtrar por título ou descrição</ListItem>
                <ListItem>• <strong>Filtros:</strong> Por status (Ativa/Inativa) e tipo de item</ListItem>
                <ListItem>• <strong>Visualizar:</strong> Ver detalhes do questionário</ListItem>
                <ListItem>• <strong>Editar:</strong> Modificar configurações</ListItem>
                <ListItem>• <strong>Excluir:</strong> Remover questionário</ListItem>
                <ListItem>• <strong>Participantes:</strong> Gerenciar quem pode responder</ListItem>
                <ListItem>• <strong>Convites:</strong> Enviar links de acesso</ListItem>
                <ListItem>• <strong>Lembretes:</strong> Enviar notificações de lembrete</ListItem>
                <ListItem>• <strong>Relatórios:</strong> Ver estatísticas e resultados</ListItem>
              </List>
            </Box>
          </Box>

          <Box>
            <Heading size="md" mb={3}>Criação de Questionários</Heading>
            <Text mb={4}>
              O processo de criação é dividido em etapas para facilitar a configuração:
            </Text>
            
            <VStack spacing={3} align="stretch">
              <Box p={3} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                <Text fontWeight="bold">1. Informações Básicas</Text>
                <Text fontSize="sm">Título, descrição, período de vigência e tipo de questionário</Text>
              </Box>
              
              <Box p={3} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                <Text fontWeight="bold">2. Tipo de Item Avaliado</Text>
                <Text fontSize="sm">Selecionar o que será avaliado (Professor, Disciplina, Curso, etc.)</Text>
              </Box>
              
              <Box p={3} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                <Text fontWeight="bold">3. Questões</Text>
                <Text fontSize="sm">Adicionar e configurar as perguntas do questionário</Text>
              </Box>
              
              <Box p={3} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                <Text fontWeight="bold">4. Participantes</Text>
                <Text fontSize="sm">Definir quem pode responder o questionário</Text>
              </Box>
            </VStack>
          </Box>
        </VStack>
      )
    },
    {
      id: 'tipos-questoes',
      title: 'Tipos de Questões',
      icon: HelpCircle,
      color: 'purple',
      content: (
        <VStack spacing={6} align="stretch">
          <Text>
            O sistema suporta diversos tipos de questões para atender diferentes necessidades 
            de coleta de dados.
          </Text>

          <VStack spacing={4} align="stretch">
            <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
              <HStack mb={2}>
                <Badge colorScheme="blue">Múltipla Escolha</Badge>
              </HStack>
              <Text fontSize="sm" mb={2}>
                Permite selecionar uma opção entre várias alternativas. Ideal para perguntas 
                com respostas categóricas.
              </Text>
              <Text fontSize="xs" color="gray.600">
                Exemplo: "Como você avalia o professor?" - Excelente, Bom, Adequado, Insuficiente, Ruim
              </Text>
            </Box>

            <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
              <HStack mb={2}>
                <Badge colorScheme="green">Escala Linear</Badge>
              </HStack>
              <Text fontSize="sm" mb={2}>
                Escala numérica de 0 a 10 com textos nas extremidades. Perfeita para 
                avaliações quantitativas.
              </Text>
              <Text fontSize="xs" color="gray.600">
                Exemplo: "Nota de 0 a 10" - 0 (Muito Ruim) até 10 (Excelente)
              </Text>
            </Box>

            <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
              <HStack mb={2}>
                <Badge colorScheme="orange">Caixa de Texto</Badge>
              </HStack>
              <Text fontSize="sm" mb={2}>
                Campo de texto livre para respostas abertas e comentários detalhados.
              </Text>
              <Text fontSize="xs" color="gray.600">
                Exemplo: "Comentários adicionais sobre o curso"
              </Text>
            </Box>

            <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
              <HStack mb={2}>
                <Badge colorScheme="purple">Menu Suspenso</Badge>
              </HStack>
              <Text fontSize="sm" mb={2}>
                Lista suspensa com opções predefinidas. Útil quando há muitas opções.
              </Text>
              <Text fontSize="xs" color="gray.600">
                Exemplo: "Selecione seu curso" - Lista de todos os cursos disponíveis
              </Text>
            </Box>

            <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
              <HStack mb={2}>
                <Badge colorScheme="teal">Matriz</Badge>
              </HStack>
              <Text fontSize="sm" mb={2}>
                Tabela com linhas e colunas para avaliações complexas com múltiplos critérios.
              </Text>
              <Text fontSize="xs" color="gray.600">
                Exemplo: Avaliar diferentes aspectos (Conteúdo, Metodologia, Recursos) 
                com as mesmas opções de resposta
              </Text>
            </Box>
          </VStack>
        </VStack>
      )
    },
    {
      id: 'questoes-condicionais',
      title: 'Questões Condicionais',
      icon: Lightbulb,
      color: 'yellow',
      content: (
        <VStack spacing={6} align="stretch">
          <Alert status="warning">
            <AlertIcon />
            <Box>
              <AlertTitle>Funcionalidade Avançada</AlertTitle>
              <AlertDescription>
                As questões condicionais permitem criar questionários dinâmicos que se adaptam 
                às respostas do usuário, mostrando perguntas específicas baseadas nas escolhas anteriores.
              </AlertDescription>
            </Box>
          </Alert>

          <Box>
            <Heading size="md" mb={3}>Como Funcionam</Heading>
            <Text mb={4}>
              Quando uma opção de uma questão principal é selecionada, uma questão adicional 
              pode aparecer automaticamente para coletar mais detalhes.
            </Text>

            <Box p={4} bg="yellow.50" borderRadius="md" border="1px solid" borderColor="yellow.200">
              <Text fontWeight="bold" mb={2}>Exemplo Prático:</Text>
              <VStack spacing={2} align="stretch">
                <Text fontSize="sm">
                  <strong>Questão Principal:</strong> "Como você avalia o serviço?"
                </Text>
                <Text fontSize="sm" ml={4}>
                  • Excelente<br/>
                  • Bom<br/>
                  • Adequado<br/>
                  • Insuficiente ← <em>(ativa questão condicional)</em><br/>
                  • Ruim ← <em>(ativa questão condicional)</em>
                </Text>
                <Text fontSize="sm">
                  <strong>Questão Condicional:</strong> "Por que considera insuficiente/ruim?"
                </Text>
                <Text fontSize="sm" ml={4}>
                  • Falta de recursos<br/>
                  • Metodologia inadequada<br/>
                  • Falta de preparo do professor<br/>
                  • Outros motivos
                </Text>
              </VStack>
            </Box>
          </Box>

          <Box>
            <Heading size="md" mb={3}>Configuração</Heading>
            <List spacing={2}>
              <ListItem>
                <ListIcon as={CheckCircle} color="green.500" />
                Marque a opção "Ativa Condição" na opção desejada
              </ListItem>
              <ListItem>
                <ListIcon as={CheckCircle} color="green.500" />
                Crie a questão condicional que será exibida
              </ListItem>
              <ListItem>
                <ListIcon as={CheckCircle} color="green.500" />
                Associe a questão condicional à opção
              </ListItem>
              <ListItem>
                <ListIcon as={CheckCircle} color="green.500" />
                A questão aparecerá automaticamente quando a opção for selecionada
              </ListItem>
            </List>
          </Box>
        </VStack>
      )
    },
    {
      id: 'tipos-itens',
      title: 'Tipos de Itens Avaliados',
      icon: Users,
      color: 'cyan',
      content: (
        <VStack spacing={6} align="stretch">
          <Text>
            O sistema suporta diferentes tipos de avaliação, cada um com características 
            específicas de renderização e coleta de dados.
          </Text>

          <Box>
            <Heading size="md" mb={3}>Renderização Normal</Heading>
            <Text mb={3}>Estes tipos exibem as questões uma única vez:</Text>
            
            <VStack spacing={2} align="stretch">
              <Box p={3} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                <Text fontWeight="bold">Curso</Text>
                <Text fontSize="sm">Avaliação geral do curso e coordenação</Text>
              </Box>
              <Box p={3} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                <Text fontWeight="bold">Estrutura</Text>
                <Text fontSize="sm">Avaliação da estrutura física da instituição</Text>
              </Box>
              <Box p={3} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                <Text fontWeight="bold">Infraestrutura</Text>
                <Text fontSize="sm">Avaliação geral da infraestrutura e serviços</Text>
              </Box>
            </VStack>
          </Box>

          <Box>
            <Heading size="md" mb={3}>Renderização Agrupada</Heading>
            <Text mb={3}>Estes tipos repetem as questões para cada item avaliado:</Text>
            
            <VStack spacing={2} align="stretch">
              <Box p={3} bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
                <Text fontWeight="bold">Professor</Text>
                <Text fontSize="sm">Avaliação individual de cada professor</Text>
              </Box>
              <Box p={3} bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
                <Text fontWeight="bold">Disciplina</Text>
                <Text fontSize="sm">Avaliação de cada disciplina cursada</Text>
              </Box>
              <Box p={3} bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
                <Text fontWeight="bold">Turma/Disciplina</Text>
                <Text fontSize="sm">Avaliação do contexto completo professor+disciplina+turma</Text>
              </Box>
              <Box p={3} bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
                <Text fontWeight="bold">Estágio</Text>
                <Text fontSize="sm">Avaliação de estágios curriculares</Text>
              </Box>
              <Box p={3} bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
                <Text fontWeight="bold">Projeto Extensionista</Text>
                <Text fontSize="sm">Avaliação de projetos de extensão</Text>
              </Box>
              <Box p={3} bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
                <Text fontWeight="bold">Coordenador</Text>
                <Text fontSize="sm">Avaliação de coordenadores de curso</Text>
              </Box>
              <Box p={3} bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
                <Text fontWeight="bold">Alunos</Text>
                <Text fontSize="sm">Avaliação de alunos (por professores)</Text>
              </Box>
              <Box p={3} bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
                <Text fontWeight="bold">Turma</Text>
                <Text fontSize="sm">Avaliação da turma como um todo</Text>
              </Box>
              <Box p={3} bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
                <Text fontWeight="bold">TCC</Text>
                <Text fontSize="sm">Avaliação de Trabalhos de Conclusão de Curso</Text>
              </Box>
            </VStack>
          </Box>
        </VStack>
      )
    },
    {
      id: 'participantes',
      title: 'Gerenciamento de Participantes',
      icon: Users,
      color: 'pink',
      content: (
        <VStack spacing={6} align="stretch">
          <Text>
            O sistema permite gerenciar quem pode responder cada questionário, 
            com diferentes tipos de participantes e métodos de adição.
          </Text>

          <Box>
            <Heading size="md" mb={3}>Tipos de Participantes</Heading>
            
            <VStack spacing={3} align="stretch">
              <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
                <Text fontWeight="bold" mb={2}>Alunos</Text>
                <Text fontSize="sm" mb={2}>
                  Estudantes que podem avaliar professores, disciplinas, cursos e infraestrutura.
                </Text>
                <Text fontSize="xs" color="gray.600">
                  Adicionados por matrícula, curso, turma ou importação em lote
                </Text>
              </Box>

              <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
                <Text fontWeight="bold" mb={2}>Professores</Text>
                <Text fontSize="sm" mb={2}>
                  Docentes que podem avaliar coordenadores, alunos e turmas.
                </Text>
                <Text fontSize="xs" color="gray.600">
                  Adicionados individualmente ou por disciplina
                </Text>
              </Box>

              <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
                <Text fontWeight="bold" mb={2}>Coordenadores</Text>
                <Text fontSize="sm" mb={2}>
                  Coordenadores de curso que podem avaliar diferentes aspectos acadêmicos.
                </Text>
                <Text fontSize="xs" color="gray.600">
                  Adicionados por curso ou coordenação
                </Text>
              </Box>
            </VStack>
          </Box>

          <Box>
            <Heading size="md" mb={3}>Métodos de Adição</Heading>
            
            <List spacing={2}>
              <ListItem>
                <ListIcon as={CheckCircle} color="green.500" />
                <strong>Individual:</strong> Adicionar participantes um por vez
              </ListItem>
              <ListItem>
                <ListIcon as={CheckCircle} color="green.500" />
                <strong>Por Curso:</strong> Adicionar todos os alunos de um curso
              </ListItem>
              <ListItem>
                <ListIcon as={CheckCircle} color="green.500" />
                <strong>Por Turma:</strong> Adicionar todos os alunos de uma turma
              </ListItem>
              <ListItem>
                <ListIcon as={CheckCircle} color="green.500" />
                <strong>Por Disciplina:</strong> Adicionar alunos matriculados em uma disciplina
              </ListItem>
              <ListItem>
                <ListIcon as={CheckCircle} color="green.500" />
                <strong>Importação em Lote:</strong> Upload de planilha com dados dos participantes
              </ListItem>
            </List>
          </Box>

          <Box>
            <Heading size="md" mb={3}>Convites e Lembretes</Heading>
            <Text mb={3}>
              Após adicionar participantes, o sistema pode enviar convites automáticos 
              e lembretes para aumentar a taxa de resposta.
            </Text>
            
            <Box p={4} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
              <Text fontWeight="bold" mb={2}>Funcionalidades de Comunicação:</Text>
              <List spacing={1} fontSize="sm">
                <ListItem>• Envio de convites por email com link único</ListItem>
                <ListItem>• Lembretes automáticos configuráveis</ListItem>
                <ListItem>• Templates personalizáveis de email</ListItem>
                <ListItem>• Acompanhamento de status de envio</ListItem>
                <ListItem>• Relatórios de participação</ListItem>
              </List>
            </Box>
          </Box>
        </VStack>
      )
    },
    {
      id: 'relatorios',
      title: 'Relatórios e Análises',
      icon: BarChart3,
      color: 'red',
      content: (
        <VStack spacing={6} align="stretch">
          <Text>
            O sistema oferece diversos tipos de relatórios e análises estatísticas 
            para interpretar os dados coletados.
          </Text>

          <Box>
            <Heading size="md" mb={3}>Tipos de Relatórios</Heading>
            
            <VStack spacing={3} align="stretch">
              <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
                <Text fontWeight="bold" mb={2}>Relatório Geral</Text>
                <Text fontSize="sm" mb={2}>
                  Visão consolidada de todas as respostas com estatísticas básicas.
                </Text>
                <Text fontSize="xs" color="gray.600">
                  Inclui: Taxa de resposta, distribuição de respostas, gráficos de barras
                </Text>
              </Box>

              <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
                <Text fontWeight="bold" mb={2}>Relatório por Questão</Text>
                <Text fontSize="sm" mb={2}>
                  Análise detalhada de cada pergunta individualmente.
                </Text>
                <Text fontSize="xs" color="gray.600">
                  Inclui: Frequência de respostas, percentuais, comentários
                </Text>
              </Box>

              <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
                <Text fontWeight="bold" mb={2}>Relatório por Item Avaliado</Text>
                <Text fontSize="sm" mb={2}>
                  Análise específica para cada professor, disciplina ou curso avaliado.
                </Text>
                <Text fontSize="xs" color="gray.600">
                  Inclui: Ranking, comparações, tendências temporais
                </Text>
              </Box>

              <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
                <Text fontWeight="bold" mb={2}>Relatório Comparativo</Text>
                <Text fontSize="sm" mb={2}>
                  Comparação entre diferentes períodos, cursos ou professores.
                </Text>
                <Text fontSize="xs" color="gray.600">
                  Inclui: Gráficos comparativos, análise de evolução
                </Text>
              </Box>
            </VStack>
          </Box>

          <Box>
            <Heading size="md" mb={3}>Métricas Disponíveis</Heading>
            
            <VStack spacing={2} align="stretch">
              <Box p={3} bg="gray.50" borderRadius="md">
                <Text fontWeight="bold" fontSize="sm">Taxa de Resposta</Text>
                <Text fontSize="xs" color="gray.600">
                  Percentual de participantes que responderam o questionário
                </Text>
              </Box>
              
              <Box p={3} bg="gray.50" borderRadius="md">
                <Text fontWeight="bold" fontSize="sm">Distribuição de Respostas</Text>
                <Text fontSize="xs" color="gray.600">
                  Frequência e percentual de cada opção de resposta
                </Text>
              </Box>
              
              <Box p={3} bg="gray.50" borderRadius="md">
                <Text fontWeight="bold" fontSize="sm">Médias e Medianas</Text>
                <Text fontSize="xs" color="gray.600">
                  Valores estatísticos para questões numéricas
                </Text>
              </Box>
              
              <Box p={3} bg="gray.50" borderRadius="md">
                <Text fontWeight="bold" fontSize="sm">Análise de Comentários</Text>
                <Text fontSize="xs" color="gray.600">
                  Processamento de respostas textuais e identificação de temas
                </Text>
              </Box>
            </VStack>
          </Box>

          <Box>
            <Heading size="md" mb={3}>Exportação de Dados</Heading>
            <Text mb={3}>
              Os relatórios podem ser exportados em diferentes formatos para análise externa.
            </Text>
            
            <List spacing={1} fontSize="sm">
              <ListItem>• <strong>PDF:</strong> Relatórios formatados para impressão</ListItem>
              <ListItem>• <strong>Excel:</strong> Dados brutos para análise avançada</ListItem>
              <ListItem>• <strong>CSV:</strong> Dados estruturados para importação</ListItem>
              <ListItem>• <strong>Power BI:</strong> Integração com ferramentas de BI</ListItem>
            </List>
          </Box>
        </VStack>
      )
    },
    {
      id: 'configuracoes',
      title: 'Configurações do Sistema',
      icon: Settings,
      color: 'gray',
      content: (
        <VStack spacing={6} align="stretch">
          <Text>
            O sistema oferece diversas configurações para personalizar o comportamento 
            e aparência das avaliações.
          </Text>

          <Box>
            <Heading size="md" mb={3}>Configurações de Questionário</Heading>
            
            <VStack spacing={3} align="stretch">
              <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
                <Text fontWeight="bold" mb={2}>Período de Vigência</Text>
                <Text fontSize="sm" mb={2}>
                  Define quando o questionário estará disponível para resposta.
                </Text>
                <Text fontSize="xs" color="gray.600">
                  Data de início e fim, com validação automática
                </Text>
              </Box>

              <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
                <Text fontWeight="bold" mb={2}>Questões Obrigatórias</Text>
                <Text fontSize="sm" mb={2}>
                  Marca quais questões devem ser respondidas obrigatoriamente.
                </Text>
                <Text fontSize="xs" color="gray.600">
                  Validação em tempo real durante o preenchimento
                </Text>
              </Box>

              <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
                <Text fontWeight="bold" mb={2}>Salvamento Automático</Text>
                <Text fontSize="sm" mb={2}>
                  Permite salvar respostas parcialmente preenchidas.
                </Text>
                <Text fontSize="xs" color="gray.600">
                  Usuário pode retomar de onde parou
                </Text>
              </Box>

              <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
                <Text fontWeight="bold" mb={2}>Anonimato</Text>
                <Text fontSize="sm" mb={2}>
                  Configura se as respostas são anônimas ou identificadas.
                </Text>
                <Text fontSize="xs" color="gray.600">
                  Impacta na coleta e análise dos dados
                </Text>
              </Box>
            </VStack>
          </Box>

          <Box>
            <Heading size="md" mb={3}>Templates de Email</Heading>
            <Text mb={3}>
              Personalize os emails de convite e lembrete enviados aos participantes.
            </Text>
            
            <Box p={4} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
              <Text fontWeight="bold" mb={2}>Elementos Personalizáveis:</Text>
              <List spacing={1} fontSize="sm">
                <ListItem>• Cabeçalho e rodapé da instituição</ListItem>
                <ListItem>• Texto de boas-vindas personalizado</ListItem>
                <ListItem>• Instruções específicas do questionário</ListItem>
                <ListItem>• Prazo para resposta</ListItem>
                <ListItem>• Informações de contato para suporte</ListItem>
              </List>
            </Box>
          </Box>

          <Box>
            <Heading size="md" mb={3}>Configurações de Lembrete</Heading>
            
            <VStack spacing={2} align="stretch">
              <Box p={3} bg="gray.50" borderRadius="md">
                <Text fontWeight="bold" fontSize="sm">Frequência</Text>
                <Text fontSize="xs" color="gray.600">
                  Quantos dias após o convite enviar o lembrete
                </Text>
              </Box>
              
              <Box p={3} bg="gray.50" borderRadius="md">
                <Text fontWeight="bold" fontSize="sm">Múltiplos Lembretes</Text>
                <Text fontSize="xs" color="gray.600">
                  Configurar vários lembretes em intervalos diferentes
                </Text>
              </Box>
              
              <Box p={3} bg="gray.50" borderRadius="md">
                <Text fontWeight="bold" fontSize="sm">Lembrete para Todos</Text>
                <Text fontSize="xs" color="gray.600">
                  Enviar lembrete mesmo para quem já respondeu
                </Text>
              </Box>
            </VStack>
          </Box>
        </VStack>
      )
    },
    {
      id: 'dicas',
      title: 'Dicas e Boas Práticas',
      icon: Lightbulb,
      color: 'orange',
      content: (
        <VStack spacing={6} align="stretch">
          <Alert status="info">
            <AlertIcon />
            <Box>
              <AlertTitle>Dicas para Melhores Resultados</AlertTitle>
              <AlertDescription>
                Siga estas recomendações para obter respostas de qualidade e alta participação.
              </AlertDescription>
            </Box>
          </Alert>

          <Box>
            <Heading size="md" mb={3}>Criação de Questionários</Heading>
            
            <VStack spacing={3} align="stretch">
              <Box p={4} bg="orange.50" borderRadius="md" border="1px solid" borderColor="orange.200">
                <Text fontWeight="bold" mb={2}>💡 Questões Claras e Objetivas</Text>
                <Text fontSize="sm">
                  Evite perguntas ambíguas ou muito longas. Use linguagem simples e direta.
                </Text>
              </Box>

              <Box p={4} bg="orange.50" borderRadius="md" border="1px solid" borderColor="orange.200">
                <Text fontWeight="bold" mb={2}>⏱️ Duração Adequada</Text>
                <Text fontSize="sm">
                  Questionários muito longos reduzem a taxa de resposta. Mantenha entre 5-15 minutos.
                </Text>
              </Box>

              <Box p={4} bg="orange.50" borderRadius="md" border="1px solid" borderColor="orange.200">
                <Text fontWeight="bold" mb={2}>📊 Misture Tipos de Questões</Text>
                <Text fontSize="sm">
                  Combine questões fechadas (múltipla escolha) com abertas (texto) para dados mais ricos.
                </Text>
              </Box>

              <Box p={4} bg="orange.50" borderRadius="md" border="1px solid" borderColor="orange.200">
                <Text fontWeight="bold" mb={2}>🎯 Foque no Essencial</Text>
                <Text fontSize="sm">
                  Inclua apenas questões que realmente contribuam para a tomada de decisão.
                </Text>
              </Box>
            </VStack>
          </Box>

          <Box>
            <Heading size="md" mb={3}>Gerenciamento de Participantes</Heading>
            
            <VStack spacing={3} align="stretch">
              <Box p={4} bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
                <Text fontWeight="bold" mb={2}>📧 Comunicação Efetiva</Text>
                <Text fontSize="sm">
                  Envie convites com antecedência e explique a importância da avaliação.
                </Text>
              </Box>

              <Box p={4} bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
                <Text fontWeight="bold" mb={2}>⏰ Timing Correto</Text>
                <Text fontSize="sm">
                  Evite períodos de provas ou férias. Escolha momentos de menor pressão acadêmica.
                </Text>
              </Box>

              <Box p={4} bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
                <Text fontWeight="bold" mb={2}>🔄 Lembretes Estratégicos</Text>
                <Text fontSize="sm">
                  Configure lembretes em intervalos apropriados, sem ser excessivo.
                </Text>
              </Box>

              <Box p={4} bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
                <Text fontWeight="bold" mb={2}>🔒 Garanta Anonimato</Text>
                <Text fontSize="sm">
                  Deixe claro que as respostas são anônimas para aumentar a honestidade.
                </Text>
              </Box>
            </VStack>
          </Box>

          <Box>
            <Heading size="md" mb={3}>Análise de Resultados</Heading>
            
            <VStack spacing={3} align="stretch">
              <Box p={4} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                <Text fontWeight="bold" mb={2}>📈 Taxa de Resposta</Text>
                <Text fontSize="sm">
                  Meta: pelo menos 70% de participação para resultados confiáveis.
                </Text>
              </Box>

              <Box p={4} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                <Text fontWeight="bold" mb={2}>📊 Análise Qualitativa</Text>
                <Text fontSize="sm">
                  Leia os comentários textuais para insights valiosos além dos números.
                </Text>
              </Box>

              <Box p={4} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                <Text fontWeight="bold" mb={2}>🔄 Acompanhamento Contínuo</Text>
                <Text fontSize="sm">
                  Compare resultados ao longo do tempo para identificar tendências.
                </Text>
              </Box>

              <Box p={4} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                <Text fontWeight="bold" mb={2}>💬 Compartilhe Resultados</Text>
                <Text fontSize="sm">
                  Comunique os resultados e as ações tomadas para manter a confiança.
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
        <Container maxW="6xl">
          <VStack spacing={8} align="stretch">
            {/* Header */}
            <Box textAlign="center">
              <HStack justify="center" mb={4}>
                <Icon as={BookOpen} w={8} h={8} color="blue.500" />
                <Heading size="xl" color="blue.600">
                  Manual do Sistema
                </Heading>
              </HStack>
              <Text fontSize="lg" color="gray.600" maxW="2xl" mx="auto">
                Guia completo para utilização do Sistema de Avaliação Institucional. 
                Aprenda a criar, gerenciar e analisar questionários de forma eficiente.
              </Text>
            </Box>

            {/* Quick Navigation */}
            <Box bg={cardBg} p={6} borderRadius="lg" border="1px solid" borderColor={borderColor}>
              <Heading size="md" mb={4}>Navegação Rápida</Heading>
              <VStack spacing={2} align="stretch">
                {sections.map((section) => (
                  <HStack
                    key={section.id}
                    p={3}
                    bg="gray.50"
                    borderRadius="md"
                    cursor="pointer"
                    _hover={{ bg: "gray.100" }}
                    onClick={() => handleToggle(section.id)}
                  >
                    <Icon as={section.icon} w={5} h={5} color={`${section.color}.500`} />
                    <Text fontWeight="medium" flex="1">{section.title}</Text>
                    <Icon 
                      as={ChevronRight} 
                      w={4} 
                      h={4} 
                      color="gray.400"
                      transform={expandedItems.includes(section.id) ? "rotate(90deg)" : "rotate(0deg)"}
                      transition="transform 0.2s"
                    />
                  </HStack>
                ))}
              </VStack>
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
                Sistema de Avaliação Institucional - Manual do Usuário v1.0
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

export default FAQPage;
