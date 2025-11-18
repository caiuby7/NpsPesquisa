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
  Text,
  useToast,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetAvaliacoes } from "../../services/avaliacao/avaliacao.service.hooks";
import {
  QuestionarioVinculoResponse,
  useExcluirQuestaoVinculo,
  useQuestionarioVinculoById,
} from "../../services/questoes-vinculos";

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

const construirFiltro = (vinculo: QuestionarioVinculoResponse) => ({
  avaliacaoAlunoId: vinculo.avaliacaoAlunoId,
  avaliacaoProfessorId: vinculo.avaliacaoProfessorId ?? undefined,
  avaliacaoCoordenadorId: vinculo.avaliacaoCoordenadorId ?? undefined,
  tipoComparacao: vinculo.tipoComparacao,
});

export const QuestoesVinculosDetalheWidget = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const params = useParams<{ id: string }>();

  const vinculoId = Number(params.id);
  const idValido = !Number.isNaN(vinculoId) && vinculoId > 0;

  const {
    data: vinculo,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuestionarioVinculoById(idValido ? vinculoId : undefined);

  const { data: avaliacoes = [] } = useGetAvaliacoes();
  const excluirQuestaoMutation = useExcluirQuestaoVinculo();

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

  const handleVoltar = () => {
    navigate("/questoes-vinculos/lista");
  };

  const handleEditar = (vinculoAtual: QuestionarioVinculoResponse | undefined) => {
    if (!vinculoAtual) return;
    const searchParams = new URLSearchParams();
    searchParams.set("avaliacaoAlunoId", String(vinculoAtual.avaliacaoAlunoId));
    if (vinculoAtual.avaliacaoProfessorId) {
      searchParams.set("avaliacaoProfessorId", String(vinculoAtual.avaliacaoProfessorId));
    }
    if (vinculoAtual.avaliacaoCoordenadorId) {
      searchParams.set("avaliacaoCoordenadorId", String(vinculoAtual.avaliacaoCoordenadorId));
    }
    searchParams.set("tipoComparacao", vinculoAtual.tipoComparacao);
    navigate(`/questoes-vinculos?${searchParams.toString()}`);
  };

  const handleExcluirQuestao = async (questaoAlunoId: number) => {
    if (!vinculo) {
      return;
    }

    try {
      await excluirQuestaoMutation.mutateAsync({
        vinculoId: vinculo.id,
        questaoAlunoId,
        filtro: construirFiltro(vinculo),
      });
      await refetch();
      queryClient.invalidateQueries({ queryKey: ["questoes-vinculos", "lista"] });
      toast({
        title: "Questão removida",
        description: "A questão foi desvinculada com sucesso.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch {
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover o vínculo. Tente novamente.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  if (!idValido) {
    return (
      <Box p={8}>
        <Stack spacing={6}>
          <Heading size="lg">Vínculo não encontrado</Heading>
          <Text>O identificador informado é inválido. Retorne para a lista e tente novamente.</Text>
          <Button alignSelf="flex-start" onClick={handleVoltar}>
            Voltar para a lista
          </Button>
        </Stack>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Flex align="center" justify="center" minH="320px">
        <Spinner size="lg" />
      </Flex>
    );
  }

  if (isError) {
    return (
      <Box p={8}>
        <Stack spacing={6}>
          <Heading size="lg">Falha ao carregar</Heading>
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {(error as Error)?.message ?? "Não foi possível obter os detalhes do vínculo."}
          </Alert>
          <Flex gap={3}>
            <Button onClick={() => { void refetch(); }} colorScheme="blue">
              Tentar novamente
            </Button>
            <Button variant="outline" onClick={handleVoltar}>
              Voltar para a lista
            </Button>
          </Flex>
        </Stack>
      </Box>
    );
  }

  if (!vinculo) {
    return (
      <Box p={8}>
        <Stack spacing={6}>
          <Heading size="lg">Vínculo não localizado</Heading>
          <Text>Nenhum vínculo ativo foi encontrado para o identificador informado.</Text>
          <Button alignSelf="flex-start" onClick={handleVoltar}>
            Voltar para a lista
          </Button>
        </Stack>
      </Box>
    );
  }

  const tipoLabel = TIPO_COMPARACAO_LABELS[vinculo.tipoComparacao] ?? vinculo.tipoComparacao;
  const possuiCoordenador = vinculo.tipoComparacao === "AlunoProfessorCoordenador";

  return (
    <Box p={8}>
      <Stack spacing={6}>
        <Flex justify="space-between" align={{ base: "flex-start", md: "center" }} gap={4} flexWrap="wrap">
          <Box>
            <Heading size="lg" mb={2}>
              Detalhes do vínculo #{vinculo.id}
            </Heading>
            <Stack spacing={1}>
              <Text>
                <strong>Aluno:</strong> {obterTituloAvaliacao(vinculo.avaliacaoAlunoId)}
              </Text>
              <Text>
                <strong>Professor:</strong> {obterTituloAvaliacao(vinculo.avaliacaoProfessorId)}
              </Text>
              {possuiCoordenador && (
                <Text>
                  <strong>Coordenador:</strong> {obterTituloAvaliacao(vinculo.avaliacaoCoordenadorId)}
                </Text>
              )}
              <Text>
                <strong>Tipo:</strong>{" "}
                <Badge colorScheme={possuiCoordenador ? "purple" : "blue"} ml={1}>
                  {tipoLabel}
                </Badge>
              </Text>
              <Text>
                <strong>Criado em:</strong> {formatDateTime(vinculo.criadoEm)}
              </Text>
              <Text>
                <strong>Atualizado em:</strong> {formatDateTime(vinculo.atualizadoEm)}
              </Text>
            </Stack>
          </Box>
          <Stack direction={{ base: "column", sm: "row" }} spacing={3}>
            <Button variant="outline" onClick={handleVoltar}>
              Voltar
            </Button>
            <Button colorScheme="blue" onClick={() => handleEditar(vinculo)}>
              Editar vínculo
            </Button>
          </Stack>
        </Flex>

        <Box>
          <Heading size="md" mb={2}>
            Questões vinculadas
          </Heading>
          <Text color="gray.600">
            Consulte as questões cadastradas para este vínculo. Você pode remover vínculos individuais caso necessário.
          </Text>
        </Box>

        {vinculo.questoes.length === 0 ? (
          <Box borderWidth="1px" borderRadius="lg" p={6} bg="gray.50">
            <Text color="gray.500">Ainda não existem questões vinculadas para este cenário.</Text>
          </Box>
        ) : (
          <Stack spacing={4}>
            {vinculo.questoes.map((questao, index) => (
              <Box key={questao.id} borderWidth="1px" borderRadius="lg" p={5} bg="white" shadow="sm">
                <Stack spacing={3}>
                  <Flex justify="space-between" align={{ base: "flex-start", md: "center" }} gap={3} flexWrap="wrap">
                    <Box>
                      <Text fontWeight="bold" fontSize="lg">
                        {`Q${index + 1}`} · ID {questao.questaoAlunoId}
                      </Text>
                      <Text color="gray.700">{questao.questaoAluno.texto}</Text>
                    </Box>
                    <Button
                      size="sm"
                      variant="outline"
                      colorScheme="red"
                      onClick={() => handleExcluirQuestao(questao.questaoAlunoId)}
                      isLoading={excluirQuestaoMutation.isPending}
                      isDisabled={excluirQuestaoMutation.isPending}
                    >
                      Remover vínculo
                    </Button>
                  </Flex>

                  <Box borderWidth="1px" borderRadius="md" p={3} bg="blue.50">
                    <Text fontWeight="semibold">Questão vinculada (Professor)</Text>
                    <Text color="gray.700">
                      {questao.questaoProfessor
                        ? `${questao.questaoProfessor.id} · ${questao.questaoProfessor.texto}`
                        : "Nenhuma"}
                    </Text>
                  </Box>

                  {possuiCoordenador && (
                    <Box borderWidth="1px" borderRadius="md" p={3} bg="purple.50">
                      <Text fontWeight="semibold">Questão vinculada (Coordenador)</Text>
                      <Text color="gray.700">
                        {questao.questaoCoordenador
                          ? `${questao.questaoCoordenador.id} · ${questao.questaoCoordenador.texto}`
                          : "Nenhuma"}
                      </Text>
                    </Box>
                  )}

                  {questao.observacao && (
                    <Box borderWidth="1px" borderRadius="md" p={3} bg="orange.50">
                      <Text fontWeight="semibold">Observação</Text>
                      <Text color="gray.700">{questao.observacao}</Text>
                    </Box>
                  )}
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  );
};

export default QuestoesVinculosDetalheWidget;

