import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Spinner,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGetAvaliacoes } from "../../services/avaliacao/avaliacao.service.hooks";
import { useListarQuestionarioVinculos } from "../../services/questoes-vinculos";

const TIPO_COMPARACAO_LABELS: Record<string, string> = {
  AlunoProfessor: "Aluno ↔ Professor",
  AlunoProfessorCoordenador: "Aluno ↔ Professor ↔ Coordenador",
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "-";
    }
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  } catch {
    return "-";
  }
};

export const QuestoesVinculosListaWidget = () => {
  const navigate = useNavigate();
  const tableBg = useColorModeValue("white", "gray.800");

  const { data: avaliacoes = [], isLoading: carregandoAvaliacoes } = useGetAvaliacoes();
  const {
    data: vinculos = [],
    isLoading: carregandoVinculos,
    isError,
    error,
  } = useListarQuestionarioVinculos();

  const avaliacaoTituloPorId = useMemo(() => {
    const map = new Map<number, string>();
    avaliacoes.forEach((avaliacao) => {
      map.set(avaliacao.id, avaliacao.titulo);
    });
    return map;
  }, [avaliacoes]);

  const obterTituloAvaliacao = (id?: number | null) => {
    if (!id) return "-";
    return avaliacaoTituloPorId.get(id) ?? `ID ${id}`;
  };

  const handleVisualizar = (vinculoId: number) => {
    navigate(`/questoes-vinculos/lista/${vinculoId}`);
  };

  const handleEditar = (item: {
    id: number;
    avaliacaoAlunoId: number;
    avaliacaoProfessorId?: number | null;
    avaliacaoCoordenadorId?: number | null;
    tipoComparacao: string;
  }) => {
    const params = new URLSearchParams();
    params.set("avaliacaoAlunoId", String(item.avaliacaoAlunoId));
    if (item.avaliacaoProfessorId) {
      params.set("avaliacaoProfessorId", String(item.avaliacaoProfessorId));
    }
    if (item.avaliacaoCoordenadorId) {
      params.set("avaliacaoCoordenadorId", String(item.avaliacaoCoordenadorId));
    }
    params.set("tipoComparacao", item.tipoComparacao);
    navigate(`/questoes-vinculos?${params.toString()}`);
  };

  const exibindoLoader = carregandoAvaliacoes || carregandoVinculos;

  return (
    <Box p={8}>
      <Stack spacing={6}>
        <Flex direction={{ base: "column", md: "row" }} align={{ base: "flex-start", md: "center" }} justify="space-between" gap={4}>
          <Box>
            <Heading size="lg" mb={2}>
              Vínculos Registrados
            </Heading>
            <Text color="gray.600">
              Veja todos os vínculos cadastrados entre avaliações. Clique em visualizar para consultar os detalhes ou em
              editar para ajustar o mapeamento de questões.
            </Text>
          </Box>
          <Button colorScheme="blue" onClick={() => navigate("/questoes-vinculos")}>
            Criar novo vínculo
          </Button>
        </Flex>

        {isError && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {(error as Error)?.message ?? "Não foi possível carregar os vínculos. Tente novamente mais tarde."}
          </Alert>
        )}

        {exibindoLoader ? (
          <Flex align="center" justify="center" minH="200px">
            <Spinner size="lg" />
          </Flex>
        ) : vinculos.length === 0 ? (
          <Box borderWidth="1px" borderRadius="lg" p={8} bg={tableBg} textAlign="center">
            <Text color="gray.500">Nenhum vínculo cadastrado até o momento.</Text>
          </Box>
        ) : (
          <Box borderWidth="1px" borderRadius="lg" overflowX="auto" bg={tableBg}>
            <Table size="sm">
              <Thead bg="gray.50">
                <Tr>
                  <Th>ID</Th>
                  <Th>Avaliação do Aluno</Th>
                  <Th>Avaliação do Professor</Th>
                  <Th>Avaliação do Coordenador</Th>
                  <Th>Tipo de Comparação</Th>
                  <Th textAlign="center">Questões</Th>
                  <Th>Criado em</Th>
                  <Th>Atualizado em</Th>
                  <Th textAlign="right">Ações</Th>
                </Tr>
              </Thead>
              <Tbody>
                {vinculos.map((item) => (
                  <Tr key={item.id} _hover={{ bg: "gray.50" }}>
                    <Td fontWeight="medium">#{item.id}</Td>
                    <Td>{obterTituloAvaliacao(item.avaliacaoAlunoId)}</Td>
                    <Td>{obterTituloAvaliacao(item.avaliacaoProfessorId)}</Td>
                    <Td>{obterTituloAvaliacao(item.avaliacaoCoordenadorId)}</Td>
                    <Td>
                      <Badge colorScheme={item.tipoComparacao === "AlunoProfessor" ? "blue" : "purple"}>
                        {TIPO_COMPARACAO_LABELS[item.tipoComparacao] ?? item.tipoComparacao}
                      </Badge>
                    </Td>
                    <Td textAlign="center">
                      <Badge colorScheme={item.totalQuestoes > 0 ? "green" : "gray"}>{item.totalQuestoes}</Badge>
                    </Td>
                    <Td>{formatDateTime(item.criadoEm)}</Td>
                    <Td>{formatDateTime(item.atualizadoEm)}</Td>
                    <Td>
                      <Flex justify="flex-end" gap={2}>
                        <Button size="sm" variant="outline" onClick={() => handleVisualizar(item.id)}>
                          Visualizar
                        </Button>
                        <Button size="sm" colorScheme="blue" onClick={() => handleEditar(item)}>
                          Editar
                        </Button>
                      </Flex>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default QuestoesVinculosListaWidget;
