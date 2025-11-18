import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Radio,
  RadioGroup,
  Select,
  Spinner,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MdSave } from "react-icons/md";
import { useGetAvaliacoes } from "../../services/avaliacao/avaliacao.service.hooks";
import { useGetForm } from "../../services/form/form.service.hooks";
import {
  QuestionarioVinculoFiltro,
  QuestionarioVinculoResponse,
  useQuestionarioVinculo,
  useSalvarQuestionarioVinculo,
} from "../../services/questoes-vinculos";

const formatarQuestoes = (avaliacao?: { questoesQuestionarios?: any[] }) => {
  if (!avaliacao?.questoesQuestionarios) return [];

  return avaliacao.questoesQuestionarios.map((item: any, index: number) => {
    const questao = item.questao ?? item;
    const questaoIdRaw = item.questaoId ?? questao?.id ?? item.id ?? index;
    const questaoIdConvertido = Number(questaoIdRaw);
    const questaoId = Number.isNaN(questaoIdConvertido) ? index : questaoIdConvertido;
    const titulo = questao?.texto ?? questao?.titulo ?? "Questão sem título";
    const descricao = questao?.descricao ?? questao?.texto ?? item.descricao;
    const ordem = item.ordem ?? questao?.ordem ?? index + 1;

    return {
      id: questaoId,
      titulo,
      descricao,
      ordem,
    };
  });
};

const ordenarQuestoes = (questoes: ReturnType<typeof formatarQuestoes>) => {
  return [...questoes].sort((a, b) => {
    if (a.ordem && b.ordem) {
      return a.ordem - b.ordem;
    }
    return a.id - b.id;
  });
};

const obterTituloAvaliacao = (avaliacoes: any[], id?: number | null) => {
  if (!id) return "";
  return avaliacoes.find((item) => item.id === id)?.titulo ?? "";
};

const formatarQuestaoResumo = (questao: { id: number; titulo: string }, indice: number) =>
  `Q${indice + 1} - ${questao.titulo}`;

type ComparacaoTipo = "AlunoProfessor" | "AlunoProfessorCoordenador";

type RowState = {
  questaoVinculoId: number | null;
  professorId: number | null;
  coordenadorId: number | null;
  remover?: boolean;
};

export const QuestoesVinculosWidget = () => {
  const toast = useToast();
  const [searchParams] = useSearchParams();

  const [tipoComparacao, setTipoComparacao] = useState<ComparacaoTipo>("AlunoProfessorCoordenador");
  const [avaliacaoAlunoId, setAvaliacaoAlunoId] = useState<number | null>(null);
  const [avaliacaoProfessorId, setAvaliacaoProfessorId] = useState<number | null>(null);
  const [avaliacaoCoordenadorId, setAvaliacaoCoordenadorId] = useState<number | null>(null);
  const [linhas, setLinhas] = useState<Record<number, RowState>>({});
  const [linhasDirty, setLinhasDirty] = useState<Record<number, boolean>>({});
  const [salvandoTudo, setSalvandoTudo] = useState(false);

  const linhasRef = useRef<Record<number, RowState>>({});
  const linhasDirtyRef = useRef<Record<number, boolean>>({});
  const linhasBaseSnapshotRef = useRef<string | null>(null);

  useEffect(() => {
    const alunoParam = searchParams.get("avaliacaoAlunoId");
    const professorParam = searchParams.get("avaliacaoProfessorId");
    const coordenadorParam = searchParams.get("avaliacaoCoordenadorId");
    const tipoParam = searchParams.get("tipoComparacao") as ComparacaoTipo | null;

    if (alunoParam) {
      setAvaliacaoAlunoId(Number(alunoParam));
    }
    if (professorParam) {
      setAvaliacaoProfessorId(Number(professorParam));
    }
    if (coordenadorParam) {
      setAvaliacaoCoordenadorId(Number(coordenadorParam));
    }
    if (tipoParam) {
      setTipoComparacao(tipoParam);
    } else if (!coordenadorParam) {
      setTipoComparacao("AlunoProfessor");
    }
  }, [searchParams]);

  const { data: avaliacoes = [], isLoading: carregandoAvaliacoes } = useGetAvaliacoes();
  const avaliacaoAlunoQuery = useGetForm({ id: avaliacaoAlunoId ? String(avaliacaoAlunoId) : "" });
  const avaliacaoProfessorQuery = useGetForm({ id: avaliacaoProfessorId ? String(avaliacaoProfessorId) : "" });
  const avaliacaoCoordenadorQuery = useGetForm({ id: avaliacaoCoordenadorId ? String(avaliacaoCoordenadorId) : "" });

  const questoesAluno = useMemo(
    () => ordenarQuestoes(formatarQuestoes(avaliacaoAlunoQuery.data)),
    [avaliacaoAlunoQuery.data]
  );
  const questoesProfessor = useMemo(
    () => ordenarQuestoes(formatarQuestoes(avaliacaoProfessorQuery.data)),
    [avaliacaoProfessorQuery.data]
  );
  const questoesCoordenador = useMemo(
    () => ordenarQuestoes(formatarQuestoes(avaliacaoCoordenadorQuery.data)),
    [avaliacaoCoordenadorQuery.data]
  );

  const questoesProfessorMap = useMemo(() => {
    const map = new Map<number, { id: number; titulo: string; indice: number }>();
    questoesProfessor.forEach((questao, index) => {
      const id = Number(questao.id);
      if (!Number.isNaN(id)) {
        map.set(id, { id, titulo: questao.titulo, indice: index });
      }
    });
    return map;
  }, [questoesProfessor]);

  const questoesCoordenadorMap = useMemo(() => {
    const map = new Map<number, { id: number; titulo: string; indice: number }>();
    questoesCoordenador.forEach((questao, index) => {
      const id = Number(questao.id);
      if (!Number.isNaN(id)) {
        map.set(id, { id, titulo: questao.titulo, indice: index });
      }
    });
    return map;
  }, [questoesCoordenador]);

  const filtroVinculo = useMemo<QuestionarioVinculoFiltro>(() => ({
    avaliacaoAlunoId: avaliacaoAlunoId ?? undefined,
    avaliacaoProfessorId: avaliacaoProfessorId ?? undefined,
    avaliacaoCoordenadorId: tipoComparacao === "AlunoProfessorCoordenador" ? avaliacaoCoordenadorId ?? undefined : undefined,
    tipoComparacao,
  }), [avaliacaoAlunoId, avaliacaoProfessorId, avaliacaoCoordenadorId, tipoComparacao]);

  const {
    data: vinculoData,
    isFetching: carregandoVinculo,
    refetch: refetchVinculo,
  } = useQuestionarioVinculo(filtroVinculo);

  const linhasBase = useMemo(() => {
    if (!avaliacaoAlunoId || !questoesAluno.length) return null;

    const base: Record<number, RowState> = {};
    const mapaQuestao = new Map<number, QuestionarioVinculoResponse["questoes"][number]>();
    vinculoData?.questoes?.forEach((questao) => {
      mapaQuestao.set(questao.questaoAlunoId, questao);
    });

    questoesAluno.forEach((questao) => {
      const atual = mapaQuestao.get(questao.id);
      base[questao.id] = {
        questaoVinculoId: atual?.id ?? null,
        professorId: atual?.questaoProfessorId ?? null,
        coordenadorId: atual?.questaoCoordenadorId ?? null,
        remover: false,
      };
    });

    return base;
  }, [avaliacaoAlunoId, questoesAluno, vinculoData]);

  useEffect(() => {
    linhasRef.current = linhas;
  }, [linhas]);

  useEffect(() => {
    linhasDirtyRef.current = linhasDirty;
  }, [linhasDirty]);

  useEffect(() => {
    if (!linhasBase) {
      if (Object.keys(linhasRef.current).length > 0) {
        linhasBaseSnapshotRef.current = null;
        setLinhas({});
        setLinhasDirty({});
      }
      return;
    }

    const possuiDirty = Object.values(linhasDirtyRef.current).some(Boolean);
    if (possuiDirty) return;

    const snapshot = JSON.stringify(linhasBase);
    if (linhasBaseSnapshotRef.current === snapshot) return;

    linhasBaseSnapshotRef.current = snapshot;

    const linhasAtualizadas: Record<number, RowState> = {};
    Object.entries(linhasBase).forEach(([key, value]) => {
      linhasAtualizadas[Number(key)] = { ...value };
    });
    setLinhas(linhasAtualizadas);

    const initialDirty: Record<number, boolean> = {};
    Object.keys(linhasBase).forEach((key) => {
      initialDirty[Number(key)] = false;
    });
    setLinhasDirty(initialDirty);
  }, [linhasBase]);

  const atualizarLinha = (questaoAlunoId: number, updates: Partial<RowState>) => {
    setLinhas((prev) => {
      const anterior = prev[questaoAlunoId] ?? {
        questaoVinculoId: null,
        professorId: null,
        coordenadorId: null,
        remover: false,
      };
      const proximo: RowState = {
        ...anterior,
        ...updates,
        remover: updates.remover ?? anterior.remover ?? false,
      };

      return {
        ...prev,
        [questaoAlunoId]: proximo,
      };
    });
    setLinhasDirty((prev) => ({ ...prev, [questaoAlunoId]: true }));
  };

  const handleProfessorChange = (questaoAlunoId: number, value: string) => {
    const novoValor = value === "none" ? null : Number(value);
    const linhaAtual = linhas[questaoAlunoId];
    const deveRemover =
      novoValor === null &&
      Boolean(linhaAtual?.questaoVinculoId) &&
      (tipoComparacao !== "AlunoProfessorCoordenador" || !linhaAtual?.coordenadorId);

    atualizarLinha(questaoAlunoId, { professorId: novoValor, remover: deveRemover ? true : false });
  };

  const handleCoordenadorChange = (questaoAlunoId: number, value: string) => {
    const novoValor = value === "none" ? null : Number(value);
    const linhaAtual = linhas[questaoAlunoId];
    const deveRemover =
      novoValor === null &&
      Boolean(linhaAtual?.questaoVinculoId) &&
      (!linhaAtual?.professorId);

    atualizarLinha(questaoAlunoId, { coordenadorId: novoValor, remover: deveRemover ? true : false });
  };

  const salvarMutation = useSalvarQuestionarioVinculo();

  const validarSelecoes = (): boolean => {
    if (!avaliacaoAlunoId) {
      toast({
        title: "Selecione a avaliação do aluno",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (!avaliacaoProfessorId) {
      toast({
        title: "Selecione a avaliação do professor",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (tipoComparacao === "AlunoProfessorCoordenador" && !avaliacaoCoordenadorId) {
      toast({
        title: "Selecione a avaliação do coordenador",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    return true;
  };

  const handleSalvarTudo = async () => {
    if (!validarSelecoes()) return;

    const possuiAlteracoes = Object.values(linhasDirty).some(Boolean);

    if (!possuiAlteracoes) {
      toast({
        title: "Nada para salvar",
        description: "Nenhuma alteração pendente foi encontrada.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSalvandoTudo(true);
    try {
      const alunoId = avaliacaoAlunoId!;
      const professorId = avaliacaoProfessorId!;
      const coordenadorId = tipoComparacao === "AlunoProfessorCoordenador" ? avaliacaoCoordenadorId ?? null : null;

      const questoesParaSalvar = Object.entries(linhas)
        .filter(([_, linha]) => {
          if (!linha || linha.remover) return false;
          const possuiProfessor = linha.professorId !== null && linha.professorId !== undefined;
          const possuiCoordenador =
            tipoComparacao === "AlunoProfessorCoordenador" &&
            linha.coordenadorId !== null &&
            linha.coordenadorId !== undefined;
          return possuiProfessor || possuiCoordenador || linha.questaoVinculoId !== null;
        })
        .map(([questaoId, linha]) => ({
          questaoAlunoId: Number(questaoId),
          questaoProfessorId: linha.professorId ?? null,
          questaoCoordenadorId:
            tipoComparacao === "AlunoProfessorCoordenador" ? linha.coordenadorId ?? null : null,
        }));

      await salvarMutation.mutateAsync({
        avaliacaoAlunoId: alunoId,
        avaliacaoProfessorId: professorId,
        avaliacaoCoordenadorId: coordenadorId,
        tipoComparacao,
        questoes: questoesParaSalvar,
      });
      await refetchVinculo();
      setLinhasDirty({});
      toast({
        title: "Mapeamento salvo",
        description: "Todas as alterações foram registradas.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível registrar o vínculo. Tente novamente.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setSalvandoTudo(false);
    }
  };

  const handleExcluirLinha = (questaoAlunoId: number) => {
    const linhaAtual = linhas[questaoAlunoId];
    setLinhas((prev) => ({
      ...prev,
      [questaoAlunoId]: {
        questaoVinculoId: linhaAtual?.questaoVinculoId ?? null,
        professorId: null,
        coordenadorId: null,
        remover: true,
      },
    }));
    setLinhasDirty((prev) => ({ ...prev, [questaoAlunoId]: true }));
  };

  const handleRestaurarLinha = (questaoAlunoId: number) => {
    const linhaBase = linhasBase?.[questaoAlunoId];
    setLinhas((prev) => ({
      ...prev,
      [questaoAlunoId]: linhaBase
        ? { ...linhaBase }
        : {
            questaoVinculoId: null,
            professorId: null,
            coordenadorId: null,
            remover: false,
          },
    }));
    setLinhasDirty((prev) => ({ ...prev, [questaoAlunoId]: false }));
  };

  const professorDisponivel = Boolean(avaliacaoProfessorId && questoesProfessor.length > 0);
  const coordenadorDisponivel = Boolean(tipoComparacao === "AlunoProfessorCoordenador" && avaliacaoCoordenadorId && questoesCoordenador.length > 0);

  const carregandoTabela =
    avaliacaoAlunoQuery.isLoading ||
    avaliacaoProfessorQuery.isLoading ||
    avaliacaoCoordenadorQuery.isLoading ||
    carregandoVinculo;

  return (
    <Box p={8}>
      <Stack spacing={6}>
        <Box>
          <Heading size="lg" mb={3}>
            Mapeamento de Questões: Aluno vs. Professor vs. Coordenador
          </Heading>
          <Text color="gray.600">
            Selecione as avaliações, vincule as questões correspondentes e salve para manter o mapeamento atualizado.
          </Text>
        </Box>

        <Box>
          <Heading size="sm" mb={2}>Cenário de comparação</Heading>
          <RadioGroup
            value={tipoComparacao}
            onChange={(value) => {
              const novoTipo = value as ComparacaoTipo;
              setTipoComparacao(novoTipo);
              if (novoTipo !== "AlunoProfessorCoordenador") {
                setAvaliacaoCoordenadorId(null);
              }
            }}
          >
            <Stack direction={{ base: "column", md: "row" }} spacing={4}>
              <Radio value="AlunoProfessor">Aluno ↔ Professor</Radio>
              <Radio value="AlunoProfessorCoordenador">Aluno ↔ Professor ↔ Coordenador</Radio>
            </Stack>
          </RadioGroup>
        </Box>

        <Stack spacing={4}>
          <Heading size="sm">Avaliações Selecionadas</Heading>
          <Stack direction={{ base: "column", md: "row" }} spacing={4}>
            <Box flex={1}>
              <Text fontWeight="semibold" mb={1}>Avaliação do Aluno (âncora)</Text>
              <Select
                placeholder="Selecione a avaliação do aluno"
                value={avaliacaoAlunoId ?? ""}
                onChange={(event) => setAvaliacaoAlunoId(event.target.value ? Number(event.target.value) : null)}
              >
                {avaliacoes.map((avaliacao) => (
                  <option key={avaliacao.id} value={avaliacao.id}>
                    {avaliacao.titulo}
                  </option>
                ))}
              </Select>
            </Box>

            <Box flex={1}>
              <Text fontWeight="semibold" mb={1}>Autoavaliação do Professor</Text>
              <Select
                placeholder="Selecione a avaliação do professor"
                value={avaliacaoProfessorId ?? ""}
                onChange={(event) => setAvaliacaoProfessorId(event.target.value ? Number(event.target.value) : null)}
                isDisabled={!avaliacaoAlunoId}
              >
                {avaliacoes.map((avaliacao) => (
                  <option key={avaliacao.id} value={avaliacao.id}>
                    {avaliacao.titulo}
                  </option>
                ))}
              </Select>
            </Box>

            {tipoComparacao === "AlunoProfessorCoordenador" && (
              <Box flex={1}>
                <Text fontWeight="semibold" mb={1}>Avaliação do Coordenador</Text>
                <Select
                  placeholder="Selecione a avaliação do coordenador"
                  value={avaliacaoCoordenadorId ?? ""}
                  onChange={(event) => setAvaliacaoCoordenadorId(event.target.value ? Number(event.target.value) : null)}
                  isDisabled={!avaliacaoAlunoId}
                >
                  {avaliacoes.map((avaliacao) => (
                    <option key={avaliacao.id} value={avaliacao.id}>
                      {avaliacao.titulo}
                    </option>
                  ))}
                </Select>
              </Box>
            )}
          </Stack>
        </Stack>

        {!avaliacaoAlunoId && (
          <Text color="gray.500">Escolha ao menos a avaliação do aluno para iniciar o mapeamento.</Text>
        )}

        {avaliacaoAlunoId && carregandoTabela && (
          <Flex align="center" justify="center" minH="160px">
            <Spinner size="lg" />
          </Flex>
        )}

        {avaliacaoAlunoId && !carregandoTabela && questoesAluno.length === 0 && (
          <Text color="gray.500">A avaliação selecionada não possui questões cadastradas.</Text>
        )}

        {avaliacaoAlunoId && !carregandoTabela && questoesAluno.length > 0 && (
          <Box borderWidth="1px" borderRadius="lg" overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead bg="gray.50">
                <Tr>
                  <Th minW="200px">Questão (Aluno)</Th>
                  <Th minW="260px">Texto da Questão do Aluno</Th>
                  <Th minW="220px">Vínculo Professor</Th>
                  <Th minW="260px">Questão Vinculada (Professor)</Th>
                  {tipoComparacao === "AlunoProfessorCoordenador" && <Th minW="220px">Vínculo Coordenador</Th>}
                  {tipoComparacao === "AlunoProfessorCoordenador" && <Th minW="260px">Questão Vinculada (Coordenador)</Th>}
                  <Th minW="160px" textAlign="center">Ações</Th>
                </Tr>
              </Thead>
              <Tbody>
                {questoesAluno.map((questaoAluno, index) => {
                  const linha = linhas[questaoAluno.id];
                  const dirty = linhasDirty[questaoAluno.id];
                  const remover = linha?.remover;
                  const professorInfo = linha?.professorId ? questoesProfessorMap.get(linha.professorId) : null;
                  const coordenadorInfo = linha?.coordenadorId ? questoesCoordenadorMap.get(linha.coordenadorId) : null;
                  const possuiVinculoOuSelecao =
                    Boolean(linha?.questaoVinculoId) ||
                    Boolean(linha?.professorId) ||
                    Boolean(linha?.coordenadorId);

                  return (
                    <Tr key={questaoAluno.id} _hover={{ bg: dirty ? "blue.50" : "gray.50" }}>
                      <Td fontWeight="semibold" verticalAlign="top">{`Q${index + 1}`}</Td>
                      <Td verticalAlign="top">{questaoAluno.titulo}</Td>
                      <Td verticalAlign="top">
                        <Select
                          placeholder={professorDisponivel ? "Selecione" : "Sem avaliação"}
                          value={
                            linha?.professorId === null || linha?.professorId === undefined
                              ? ""
                              : String(linha.professorId)
                          }
                          onChange={(event) => handleProfessorChange(questaoAluno.id, event.target.value || "none")}
                          isDisabled={!professorDisponivel}
                        >
                          <option value="none">Nenhuma / Não aplicável</option>
                          {questoesProfessor.map((questao, indiceProfessor) => (
                            <option key={questao.id} value={questao.id}>
                              {formatarQuestaoResumo({ id: questao.id, titulo: questao.titulo }, indiceProfessor)}
                            </option>
                          ))}
                        </Select>
                      </Td>
                      <Td verticalAlign="top">
                        <Text color={linha?.professorId ? "gray.800" : "gray.500"}>
                          {professorInfo
                            ? formatarQuestaoResumo(
                                { id: professorInfo.id, titulo: professorInfo.titulo },
                                professorInfo.indice
                              )
                            : "Nenhum"}
                        </Text>
                      </Td>
                      {tipoComparacao === "AlunoProfessorCoordenador" && (
                        <Td verticalAlign="top">
                          <Select
                            placeholder={coordenadorDisponivel ? "Selecione" : "Sem avaliação"}
                            value={
                              linha?.coordenadorId === null || linha?.coordenadorId === undefined
                                ? ""
                                : String(linha.coordenadorId)
                            }
                            onChange={(event) => handleCoordenadorChange(questaoAluno.id, event.target.value || "none")}
                            isDisabled={!coordenadorDisponivel}
                          >
                            <option value="none">Nenhuma / Não aplicável</option>
                            {questoesCoordenador.map((questao, indiceCoordenador) => (
                              <option key={questao.id} value={questao.id}>
                                {formatarQuestaoResumo(
                                  { id: questao.id, titulo: questao.titulo },
                                  indiceCoordenador
                                )}
                              </option>
                            ))}
                          </Select>
                        </Td>
                      )}
                      {tipoComparacao === "AlunoProfessorCoordenador" && (
                        <Td verticalAlign="top">
                          <Text color={linha?.coordenadorId ? "gray.800" : "gray.500"}>
                            {coordenadorInfo
                              ? formatarQuestaoResumo(
                                  { id: coordenadorInfo.id, titulo: coordenadorInfo.titulo },
                                  coordenadorInfo.indice
                                )
                              : "Nenhum"}
                          </Text>
                        </Td>
                      )}
                      <Td verticalAlign="top" textAlign="center">
                        <Stack direction={{ base: "column", md: "row" }} spacing={2} justify="center">
                          {dirty && <Badge colorScheme="yellow">Alterado</Badge>}
                          {remover && <Badge colorScheme="red">Será removida</Badge>}
                          {remover ? (
                            <Button
                              size="sm"
                              colorScheme="gray"
                              variant="outline"
                              onClick={() => handleRestaurarLinha(questaoAluno.id)}
                            >
                              Cancelar remoção
                            </Button>
                          ) : (
                            possuiVinculoOuSelecao && (
                              <Button
                                size="sm"
                                colorScheme="red"
                                variant="outline"
                                onClick={() => handleExcluirLinha(questaoAluno.id)}
                              >
                                Excluir
                              </Button>
                            )
                          )}
                        </Stack>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        )}

        {avaliacaoAlunoId && questoesAluno.length > 0 && (
          <Flex justify="flex-end">
            <Button
              colorScheme="blue"
              leftIcon={<MdSave />}
              onClick={handleSalvarTudo}
              isLoading={salvandoTudo}
            >
              Salvar Mapeamento
            </Button>
          </Flex>
        )}
      </Stack>
    </Box>
  );
};

export default QuestoesVinculosWidget;

