import { useParams, useNavigate } from "react-router-dom";
import { Box, Button, Heading, Stack, Text, HStack, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import ExecutionForm from "../../app/widgets/execution-question/execution-question.component";
import { QuestionResponse } from "../../app/services/form";

interface ItemAvaliado {
  id: number;
  tipoItemAvaliado: string;
  nomeItemEspecifico: string;
  descricaoItem?: string;
  itemAvaliadoId?: number;
  professorId?: number;
  disciplinaId?: number;
  turmaDisciplinaId?: number;
  cursoId?: number;
  turmaId?: number;
  coordenadorId?: number;
}

interface QuestionarioResponse {
  questionario: {
    id: number;
    titulo: string;
    descricao: string;
    dataInicio: string;
    dataFim: string;
    questoes: QuestionResponse[];
    textoBoasVindas?: string;
  };
  tipoItemAvaliado?: string;
  itensAvaliados?: ItemAvaliado[];
  participante: {
    id: number;
    nome: string;
    email: string;
    tipo: string;
    aluno?: any;
    professor?: any;
    coordenador?: any;
  };
}

export default function QuestionarioPorChavePage() {
  const { chave } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<QuestionarioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    async function loadQuestionario() {
      if (!chave) return;
      try {
        const response = await api.get(`/Questionario/por-chave/${chave}`);
        setData(response.data);
      } catch (error: any) {
        console.error('Erro ao carregar questionário:', error);
        console.error('Detalhes do erro:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.response?.data?.message
        });
        
        // Verificar se é a mensagem específica do backend
        if (error.response?.data?.message) {
          alert(error.response.data.message);
        } else if (error.response?.status === 400) {
          // Para status 400, tentar extrair a mensagem de diferentes formas
          const message = error.response?.data?.message || error.response?.data || "Erro ao carregar questionário.";
          alert(message);
        } else {
          alert("Erro ao carregar questionário. O link pode ter expirado ou o questionário não existe mais.");
        }
      } finally {
        setLoading(false);
      }
    }
    loadQuestionario();
  }, [chave]);

  if (loading) {
    return (
      <Box minH="100vh" bgImage="url('/login-bg.jpg')" backgroundSize="cover" backgroundPosition="center">
        <Box p={8} maxW="900px" m="auto">
          <Text>Carregando questionário...</Text>
        </Box>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box minH="100vh" bgImage="url('/login-bg.jpg')" backgroundSize="cover" backgroundPosition="center">
        <Box p={8} maxW="900px" m="auto" bg="rgba(255,255,255,0.85)" borderRadius="2xl" border="2px solid rgba(255,255,255,0.5)">
          <Stack gap={8}>
            <Heading>Questionário não encontrado</Heading>
            <Text>O link pode ter expirado ou o questionário não existe mais.</Text>
            <Button colorScheme="blue" onClick={() => navigate("/")}>Voltar para o início</Button>
          </Stack>
        </Box>
      </Box>
    );
  }

  if (!started) {
    return (
      <Box minH="100vh" bg="white" py={8}>
        <Box maxW="800px" mx="auto" px={4}>
          {/* Card Principal */}
          <Box 
            bg="white" 
            borderRadius="xl" 
            boxShadow="lg" 
            border="1px solid" 
            borderColor="gray.200"
            overflow="hidden"
          >
            {/* Cabeçalho com Logo */}
            <Box bg="white" p={8} borderBottom="1px solid" borderColor="gray.200">
              <HStack spacing={4} align="center" mb={6}>
                <img src="/logo.png" alt="Católica de Santa Catarina" style={{ height: 60 }} />
                <VStack align="start" spacing={1}>
                  <Text fontSize="lg" color="gray.700" fontWeight="bold">
                    Católica de Santa Catarina Centro Universitário
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Centro Universitário
                  </Text>
                </VStack>
              </HStack>
              
              {/* Título da Avaliação */}
              <Text fontSize="3xl" fontWeight="bold" color="gray.800" textAlign="center" mb={6}>
                {data.questionario.titulo}
              </Text>
            </Box>

            {/* Conteúdo de Início */}
            <Box p={8} textAlign="center">
              <VStack spacing={6} align="center">
                <Text fontSize="lg" color="gray.600" lineHeight="1.6">
                  {data.questionario.textoBoasVindas || "Suas respostas são muito importantes para nós."}
                </Text>
                
                <Box bg="blue.50" p={6} borderRadius="lg" border="1px solid" borderColor="blue.200" w="full">
                  <VStack spacing={4}>
                    <Text fontSize="md" fontWeight="semibold" color="blue.800">
                      Instruções:
                    </Text>
                    <VStack spacing={2} align="start" w="full">
                      <Text fontSize="sm" color="blue.700">
                        • Leia cada pergunta com atenção
                      </Text>
                      <Text fontSize="sm" color="blue.700">
                        • Selecione a opção que melhor representa sua opinião
                      </Text>
                      <Text fontSize="sm" color="blue.700">
                        • Todas as respostas são confidenciais
                      </Text>
                    </VStack>
                  </VStack>
                </Box>

                <Button
                  bg="red.500"
                  color="white"
                  size="lg"
                  onClick={() => setStarted(true)}
                  px={12}
                  py={4}
                  fontSize="lg"
                  fontWeight="bold"
                  borderRadius="lg"
                  _hover={{
                    bg: "red.600",
                    transform: "translateY(-2px)",
                    boxShadow: "lg"
                  }}
                  transition="all 0.2s"
                >
                  Começar Questionário
                </Button>
              </VStack>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="white" py={6}>
      <Box maxW="800px" mx="auto" px={4}>
        <VStack spacing={6} align="stretch">
          {/* Cabeçalho com Logo e Nome da Avaliação */}
          <Box bg="white" p={6} borderRadius="lg" boxShadow="md" border="1px solid" borderColor="gray.200">
            <HStack spacing={4} align="center" mb={4}>
              <img src="/logo.png" alt="Católica de Santa Catarina" style={{ height: 50 }} />
              <VStack align="start" spacing={1}>
                <Text fontSize="md" color="gray.700" fontWeight="bold">
                  Católica de Santa Catarina Centro Universitário
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Centro Universitário
                </Text>
              </VStack>
            </HStack>
            
            <Text fontSize="2xl" fontWeight="bold" color="gray.800" textAlign="center">
              {data.questionario.titulo}
            </Text>
          </Box>

          {/* Seção de Informações - Mostrar apenas para Disciplina, Turma, Estágio, TCC e Projeto Extensionista */}
          {(data.tipoItemAvaliado === "Disciplina" || data.tipoItemAvaliado === "Turma" || 
            data.tipoItemAvaliado === "Estagio" || data.tipoItemAvaliado === "TCC" || 
            data.tipoItemAvaliado === "ProjetoExtensionista") && (
            <Box bg="blue.50" p={6} borderRadius="lg" border="1px solid" borderColor="blue.200">
              <HStack spacing={3} mb={3}>
                <Box w={6} h={6} bg="green.500" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                  <Text color="white" fontSize="sm" fontWeight="bold">📋</Text>
                </Box>
                <Text fontSize="lg" fontWeight="bold" color="blue.800">
                  {data.tipoItemAvaliado === "Disciplina" ? "Suas Disciplinas" : 
                   data.tipoItemAvaliado === "Turma" ? "Suas Turmas" :
                   data.tipoItemAvaliado === "Estagio" ? "Seus Estágios" :
                   data.tipoItemAvaliado === "TCC" ? "Seus TCCs" :
                   data.tipoItemAvaliado === "ProjetoExtensionista" ? "Seus Projetos Extensionistas" :
                   "Seus Itens"}
                </Text>
              </HStack>
              <Text color="blue.700">
                {data.tipoItemAvaliado === "Disciplina" ? (
                  <>
                    Você está matriculado em <Text as="span" fontWeight="bold" bg="blue.100" px={2} py={1} borderRadius="md">{data.itensAvaliados?.length || 0} disciplinas</Text>. 
                    Para cada disciplina, avalie os aspectos listados abaixo.
                  </>
                ) : data.tipoItemAvaliado === "Turma" ? (
                  <>
                    Você está matriculado em <Text as="span" fontWeight="bold" bg="blue.100" px={2} py={1} borderRadius="md">{data.itensAvaliados?.length || 0} turmas</Text>. 
                    Para cada turma, avalie os aspectos listados abaixo.
                  </>
                ) : data.tipoItemAvaliado === "Estagio" ? (
                  <>
                    Você está matriculado em <Text as="span" fontWeight="bold" bg="blue.100" px={2} py={1} borderRadius="md">{data.itensAvaliados?.length || 0} estágios</Text>. 
                    Para cada estágio, avalie os aspectos listados abaixo.
                  </>
                ) : data.tipoItemAvaliado === "TCC" ? (
                  <>
                    Você está matriculado em <Text as="span" fontWeight="bold" bg="blue.100" px={2} py={1} borderRadius="md">{data.itensAvaliados?.length || 0} TCCs</Text>. 
                    Para cada TCC, avalie os aspectos listados abaixo.
                  </>
                ) : data.tipoItemAvaliado === "ProjetoExtensionista" ? (
                  <>
                    Você está matriculado em <Text as="span" fontWeight="bold" bg="blue.100" px={2} py={1} borderRadius="md">{data.itensAvaliados?.length || 0} projetos extensionistas</Text>. 
                    Para cada projeto extensionista, avalie os aspectos listados abaixo.
                  </>
                ) : (
                  <>
                    Você está matriculado em <Text as="span" fontWeight="bold" bg="blue.100" px={2} py={1} borderRadius="md">{data.itensAvaliados?.length || 0} itens</Text>. 
                    Para cada item, avalie os aspectos listados abaixo.
                  </>
                )}
              </Text>
            </Box>
          )}

          {/* Seção de Avaliação */}
          <Box bg="white" p={6} borderRadius="lg" boxShadow="md" border="1px solid" borderColor="gray.200">
            <HStack spacing={3} mb={4}>
              <Box w={6} h={6} bg="blue.500" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                <Text color="white" fontSize="sm" fontWeight="bold">📊</Text>
              </Box>
            <Text fontSize="lg" fontWeight="bold" color="blue.800">
              {data.tipoItemAvaliado === "Disciplina" ? "Avaliação das Disciplinas" : 
               data.tipoItemAvaliado === "Turma" ? "Avaliação das Turmas" :
               data.tipoItemAvaliado === "Curso" ? "Avaliação do Curso" : 
               data.tipoItemAvaliado === "Professor" ? "Avaliação do Professor" :
               data.tipoItemAvaliado === "Coordenador" ? "Avaliação do Coordenador" :
               data.tipoItemAvaliado === "Estagio" ? "Avaliação dos Estágios" :
               data.tipoItemAvaliado === "TCC" ? "Avaliação dos TCCs" :
               data.tipoItemAvaliado === "ProjetoExtensionista" ? "Avaliação dos Projetos Extensionistas" :
               data.tipoItemAvaliado === "Infraestrutura" ? "Avaliação de Infraestrutura" :
               "Avaliação"}
            </Text>
            </HStack>
            
            <Text mb={6} color="gray.600">
              {data.tipoItemAvaliado === "Disciplina" ? 
                "Para cada disciplina, indique o grau de concordância com as seguintes afirmações:" :
               data.tipoItemAvaliado === "Turma" ?
                "Para cada turma, indique o grau de concordância com as seguintes afirmações:" :
               data.tipoItemAvaliado === "Estagio" ?
                "Para cada estágio, indique o grau de concordância com as seguintes afirmações:" :
               data.tipoItemAvaliado === "TCC" ?
                "Para cada TCC, indique o grau de concordância com as seguintes afirmações:" :
               data.tipoItemAvaliado === "ProjetoExtensionista" ?
                "Para cada projeto extensionista, indique o grau de concordância com as seguintes afirmações:" :
                "Indique o grau de concordância com as seguintes afirmações:"}
            </Text>

            {/* Tarja azul com nome do item - mostrar apenas quando não for Disciplina */}
            {(data.tipoItemAvaliado === "Curso" || data.tipoItemAvaliado === "Infraestrutura") && data.itensAvaliados && data.itensAvaliados.length > 0 && (
              <Box bg="blue.600" p={4} borderRadius="lg" mb={6}>
                <HStack spacing={3}>
                  <Box w={6} h={6} bg="white" borderRadius="sm" display="flex" alignItems="center" justifyContent="center">
                    <Text color="blue.600" fontSize="sm" fontWeight="bold">📚</Text>
                  </Box>
                  <VStack spacing={1} align="start">
                    <Text fontWeight="bold" fontSize="lg" color="white">
                      {data.itensAvaliados[0].nomeItemEspecifico}
                    </Text>
                    {data.itensAvaliados[0].descricaoItem && (
                      <Text fontSize="sm" color="blue.100" fontWeight="normal">
                        {data.itensAvaliados[0].descricaoItem}
                      </Text>
                    )}
                  </VStack>
                </HStack>
              </Box>
            )}

            <ExecutionForm 
              questionarioId={data.questionario.id}
              participanteId={data.participante.id}
              chave={chave as string}
              tipoItemAvaliado={data.tipoItemAvaliado}
              itensAvaliados={data.itensAvaliados}
            />
          </Box>
        </VStack>
      </Box>
    </Box>
  );
} 