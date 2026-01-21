import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Select,
  Checkbox,
  CheckboxGroup,
  Button,
  Heading,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
  Divider,
  FormControl,
  FormLabel,
  FormHelperText,
  Collapse,
  IconButton,
  SimpleGrid
} from '@chakra-ui/react';
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react';
import { api } from '../../services/api';

interface FiltrosAvancadosProps {
  tipoItemAvaliado: string;
  onFiltrosChange: (filtros: FiltrosAvancadosData) => void;
  filtrosIniciais?: FiltrosAvancadosData;
  isLoading?: boolean;
}

interface FiltrosAvancadosData {
  // Filtros básicos
  instituicaoId?: number;
  periodoLetivoId?: number;
  cursoId?: number;
  turmaId?: number;
  disciplinaId?: number;
  professorId?: number;
  
  // Filtros avançados
  nivelEnsino?: string[];
  tiposTurma?: string[];
  tiposProfessor?: string[];
  statusMatricula?: string[];
  tiposDisciplina?: string[];
  
  // Filtros de contexto
  contextoAluno?: string;
  incluirTurmasGerenciadas?: boolean;
  incluirTurmasNaoGerenciadas?: boolean;
  
  // Filtros de data
  dataInicio?: string;
  dataFim?: string;
}

interface OpcoesFiltro {
  instituicoes: Array<{ id: number; nome: string }>;
  periodosLetivos: Array<{ id: number; nome: string; ano: number }>;
  cursos: Array<{ id: number; nome: string; codigo: string }>;
  turmas: Array<{ id: number; nome: string; codigo: string }>;
  disciplinas: Array<{ id: number; nome: string; codigo: string }>;
  professores: Array<{ id: number; nome: string; email: string }>;
  niveisEnsino: Array<{ value: string; label: string }>;
  tiposTurma: Array<{ value: string; label: string }>;
  tiposProfessor: Array<{ value: string; label: string }>;
  statusMatricula: Array<{ value: string; label: string }>;
  tiposDisciplina: Array<{ value: string; label: string }>;
}

const FiltrosAvancados: React.FC<FiltrosAvancadosProps> = ({
  tipoItemAvaliado,
  onFiltrosChange,
  filtrosIniciais = {},
  isLoading = false
}) => {
  const toast = useToast();
  const [filtros, setFiltros] = useState<FiltrosAvancadosData>(filtrosIniciais);
  const [opcoes, setOpcoes] = useState<OpcoesFiltro>({
    instituicoes: [],
    periodosLetivos: [],
    cursos: [],
    turmas: [],
    disciplinas: [],
    professores: [],
    niveisEnsino: [],
    tiposTurma: [],
    tiposProfessor: [],
    statusMatricula: [],
    tiposDisciplina: []
  });
  const [carregando, setCarregando] = useState(true);
  const [filtrosExpandidos, setFiltrosExpandidos] = useState(false);
  const [filtrosAplicados, setFiltrosAplicados] = useState(0);

  // Carregar opções da API
  useEffect(() => {
    const carregarOpcoes = async () => {
      try {
        setCarregando(true);
        
        // Carregar dados básicos
        const [instituicoesRes, periodosRes, cursosRes] = await Promise.all([
          api.get('/Instituicao'),
          api.get('/PeriodoLetivo'),
          api.get('/Curso')
        ]);

        // Carregar opções de filtro
        const opcoesRes = await api.get('/Questionario/opcoes-filtro');

        setOpcoes({
          instituicoes: instituicoesRes.data || [],
          periodosLetivos: periodosRes.data || [],
          cursos: cursosRes.data || [],
          turmas: [],
          disciplinas: [],
          professores: [],
          niveisEnsino: opcoesRes.data?.niveisEnsino || [
            { value: 'GraduacaoPresencial', label: 'Graduação Presencial' },
            { value: 'GraduacaoEAD', label: 'Graduação EAD' },
            { value: 'PosGraduacao', label: 'Pós-graduação' },
            { value: 'EnsinoMedio', label: 'Ensino Médio' },
            { value: 'EnsinoTecnico', label: 'Ensino Técnico' }
          ],
          tiposTurma: opcoesRes.data?.tiposTurma || [
            { value: 'Presencial', label: 'Presencial' },
            { value: 'Semipresencial', label: 'Semipresencial' },
            { value: 'EAD', label: 'EAD' }
          ],
          tiposProfessor: opcoesRes.data?.tiposProfessor || [
            { value: 'Titular', label: 'Titular' },
            { value: 'Tutor', label: 'Tutor' },
            { value: 'Coordenador', label: 'Coordenador' }
          ],
          statusMatricula: opcoesRes.data?.statusMatricula || [
            { value: 'Matriculado', label: 'Matriculado' },
            { value: 'Calouro', label: 'Calouro' },
            { value: 'Formando', label: 'Formando' },
            { value: 'Veterano', label: 'Veterano' }
          ],
          tiposDisciplina: opcoesRes.data?.tiposDisciplina || [
            { value: 'NORMAL', label: 'Normal' },
            { value: 'ESTAGIO', label: 'Estágio' },
            { value: 'TCC', label: 'TCC' },
            { value: 'PAC_Extensionista', label: 'PAC Extensionista' }
          ]
        });

      } catch (error) {
        console.error('Erro ao carregar opções:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao carregar opções de filtro',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setCarregando(false);
      }
    };

    carregarOpcoes();
  }, [toast]);

  // Carregar dados dependentes
  useEffect(() => {
    const carregarDadosDependentes = async () => {
      if (!filtros.instituicaoId || !filtros.periodoLetivoId) return;

      try {
        // Carregar turmas baseado na instituição e período
        const turmasRes = await api.get(`/Turma?instituicaoId=${filtros.instituicaoId}&periodoLetivoId=${filtros.periodoLetivoId}`);
        
        // Carregar disciplinas baseado na instituição
        const disciplinasRes = await api.get(`/Disciplina?instituicaoId=${filtros.instituicaoId}`);
        
        // Carregar professores baseado na instituição
        const professoresRes = await api.get(`/Professor?instituicaoId=${filtros.instituicaoId}`);

        setOpcoes(prev => ({
          ...prev,
          turmas: turmasRes.data || [],
          disciplinas: disciplinasRes.data || [],
          professores: professoresRes.data || []
        }));

      } catch (error) {
        console.error('Erro ao carregar dados dependentes:', error);
      }
    };

    carregarDadosDependentes();
  }, [filtros.instituicaoId, filtros.periodoLetivoId]);

  // Atualizar filtros aplicados
  useEffect(() => {
    const count = Object.values(filtros).filter(value => 
      value !== undefined && value !== null && 
      (Array.isArray(value) ? value.length > 0 : value !== '')
    ).length;
    setFiltrosAplicados(count);
  }, [filtros]);

  const handleFiltroChange = (campo: keyof FiltrosAvancadosData, valor: any) => {
    const novosFiltros = { ...filtros, [campo]: valor };
    setFiltros(novosFiltros);
    onFiltrosChange(novosFiltros);
  };

  const handleArrayChange = (campo: keyof FiltrosAvancadosData, valor: string, checked: boolean) => {
    const arrayAtual = (filtros[campo] as string[]) || [];
    const novoArray = checked 
      ? [...arrayAtual, valor]
      : arrayAtual.filter(item => item !== valor);
    
    handleFiltroChange(campo, novoArray);
  };

  const limparFiltros = () => {
    const filtrosLimpos: FiltrosAvancadosData = {};
    setFiltros(filtrosLimpos);
    onFiltrosChange(filtrosLimpos);
  };

  const getFiltrosVisiveis = () => {
    const filtrosVisiveis: string[] = ['instituicao'];
    
    switch (tipoItemAvaliado) {
      case 'Professor':
        filtrosVisiveis.push('periodoLetivo', 'curso', 'disciplina', 'tiposProfessor', 'nivelEnsino');
        break;
      case 'Disciplina':
        filtrosVisiveis.push('periodoLetivo', 'curso', 'tiposDisciplina', 'nivelEnsino');
        break;
      case 'TurmaDisciplina':
        filtrosVisiveis.push('periodoLetivo', 'curso', 'turma', 'disciplina', 'professor', 'tiposProfessor', 'tiposDisciplina', 'nivelEnsino', 'tiposTurma');
        break;
      case 'Curso':
        filtrosVisiveis.push('periodoLetivo', 'nivelEnsino');
        break;
      case 'Alunos':
        filtrosVisiveis.push('periodoLetivo', 'curso', 'turma', 'statusMatricula', 'nivelEnsino', 'tiposTurma');
        break;
      case 'Turma':
        filtrosVisiveis.push('periodoLetivo', 'curso', 'tiposTurma', 'nivelEnsino');
        break;
      case 'Estrutura':
      case 'Pesquisa':
        filtrosVisiveis.push('periodoLetivo');
        break;
    }
    
    return filtrosVisiveis;
  };

  const renderSelect = (
    label: string,
    campo: keyof FiltrosAvancadosData,
    opcoes: Array<{ id?: number; value?: string; nome?: string; label?: string }>,
    placeholder: string
  ) => {
    const valorAtual = filtros[campo];
    const valorString = typeof valorAtual === 'number' ? valorAtual.toString() : 
                       typeof valorAtual === 'string' ? valorAtual : '';
    
    const opcoesFormatadas = opcoes.map(opcao => ({
      value: opcao.id || opcao.value || '',
      label: opcao.nome || opcao.label || ''
    }));

    return (
      <FormControl>
        <FormLabel fontSize="sm" fontWeight="500">{label}</FormLabel>
        <Select
          value={valorString}
          onChange={(e) => handleFiltroChange(campo, e.target.value ? parseInt(e.target.value) : undefined)}
          placeholder={placeholder}
          size="sm"
        >
          {opcoesFormatadas.map(opcao => (
            <option key={opcao.value} value={opcao.value}>
              {opcao.label}
            </option>
          ))}
        </Select>
      </FormControl>
    );
  };

  const renderCheckboxGroup = (
    label: string,
    campo: keyof FiltrosAvancadosData,
    opcoes: Array<{ value: string; label: string }>
  ) => {
    const valoresAtuais = (filtros[campo] as string[]) || [];

    return (
      <FormControl>
        <FormLabel fontSize="sm" fontWeight="500">{label}</FormLabel>
        <VStack align="start" spacing={1} maxH="120px" overflowY="auto" border="1px solid" borderColor="gray.200" borderRadius="md" p={2}>
          {opcoes.map(opcao => (
            <Checkbox
              key={opcao.value}
              size="sm"
              isChecked={valoresAtuais.includes(opcao.value)}
              onChange={(e) => handleArrayChange(campo, opcao.value, e.target.checked)}
              colorScheme="blue"
            >
              {opcao.label}
            </Checkbox>
          ))}
        </VStack>
      </FormControl>
    );
  };

  if (carregando) {
    return (
      <Box p={4} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
        <HStack spacing={3} justify="center">
          <Spinner size="sm" color="blue.500" />
          <Text color="gray.600" fontSize="sm">Carregando filtros...</Text>
        </HStack>
      </Box>
    );
  }

  const filtrosVisiveis = getFiltrosVisiveis();

  return (
    <Box>
      {/* Header dos Filtros */}
      <HStack justify="space-between" mb={4}>
        <HStack spacing={2}>
          <Filter size={20} color="var(--chakra-colors-blue-500)" />
          <Heading size="sm" color="gray.700">
            Filtros Avançados
          </Heading>
          {filtrosAplicados > 0 && (
            <Badge colorScheme="blue" variant="subtle">
              {filtrosAplicados} filtro(s) aplicado(s)
            </Badge>
          )}
        </HStack>
        <HStack spacing={2}>
          <Button
            size="xs"
            variant="outline"
            colorScheme="gray"
            onClick={limparFiltros}
            leftIcon={<X size={14} />}
          >
            Limpar
          </Button>
          <IconButton
            size="sm"
            variant="outline"
            aria-label={filtrosExpandidos ? "Recolher filtros" : "Expandir filtros"}
            icon={filtrosExpandidos ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            onClick={() => setFiltrosExpandidos(!filtrosExpandidos)}
          />
        </HStack>
      </HStack>

      {/* Filtros Básicos - Sempre Visíveis */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} mb={4}>
        {filtrosVisiveis.includes('instituicao') && 
          renderSelect('Instituição', 'instituicaoId', opcoes.instituicoes, 'Selecione a instituição')
        }
        
        {filtrosVisiveis.includes('periodoLetivo') && 
          renderSelect('Período Letivo', 'periodoLetivoId', opcoes.periodosLetivos, 'Selecione o período')
        }
        
        {filtrosVisiveis.includes('curso') && 
          renderSelect('Curso', 'cursoId', opcoes.cursos, 'Selecione o curso')
        }
        
        {filtrosVisiveis.includes('turma') && 
          renderSelect('Turma', 'turmaId', opcoes.turmas, 'Selecione a turma')
        }
        
        {filtrosVisiveis.includes('disciplina') && 
          renderSelect('Disciplina', 'disciplinaId', opcoes.disciplinas, 'Selecione a disciplina')
        }
        
        {filtrosVisiveis.includes('professor') && 
          renderSelect('Professor', 'professorId', opcoes.professores, 'Selecione o professor')
        }
      </SimpleGrid>

      {/* Filtros Avançados - Colapsáveis */}
      <Collapse in={filtrosExpandidos} animateOpacity>
        <Box p={4} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" fontWeight="500" color="gray.600">
              Filtros Específicos por Contexto
            </Text>
            
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {filtrosVisiveis.includes('nivelEnsino') && 
                renderCheckboxGroup('Níveis de Ensino', 'nivelEnsino', opcoes.niveisEnsino)
              }
              
              {filtrosVisiveis.includes('tiposTurma') && 
                renderCheckboxGroup('Tipos de Turma', 'tiposTurma', opcoes.tiposTurma)
              }
              
              {filtrosVisiveis.includes('tiposProfessor') && 
                renderCheckboxGroup('Tipos de Professor', 'tiposProfessor', opcoes.tiposProfessor)
              }
              
              {filtrosVisiveis.includes('statusMatricula') && 
                renderCheckboxGroup('Status de Matrícula', 'statusMatricula', opcoes.statusMatricula)
              }
              
              {filtrosVisiveis.includes('tiposDisciplina') && 
                renderCheckboxGroup('Tipos de Disciplina', 'tiposDisciplina', opcoes.tiposDisciplina)
              }
            </SimpleGrid>

            {/* Filtros de Contexto */}
            <Box>
              <Text fontSize="sm" fontWeight="500" color="gray.600" mb={2}>
                Contexto do Aluno
              </Text>
              <HStack spacing={4}>
                <FormControl>
                  <FormLabel fontSize="xs">Contexto</FormLabel>
                  <Select
                    value={filtros.contextoAluno || ''}
                    onChange={(e) => handleFiltroChange('contextoAluno', e.target.value)}
                    placeholder="Selecione o contexto"
                    size="sm"
                  >
                    <option value="Ambos">EaD e Presencial</option>
                    <option value="EaD">Apenas EaD</option>
                    <option value="Presencial">Apenas Presencial</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel fontSize="xs">Turmas Gerenciadas</FormLabel>
                  <VStack align="start" spacing={1}>
                    <Checkbox
                      size="sm"
                      isChecked={filtros.incluirTurmasGerenciadas ?? true}
                      onChange={(e) => handleFiltroChange('incluirTurmasGerenciadas', e.target.checked)}
                    >
                      Incluir Gerenciadas
                    </Checkbox>
                    <Checkbox
                      size="sm"
                      isChecked={filtros.incluirTurmasNaoGerenciadas ?? true}
                      onChange={(e) => handleFiltroChange('incluirTurmasNaoGerenciadas', e.target.checked)}
                    >
                      Incluir Não Gerenciadas
                    </Checkbox>
                  </VStack>
                </FormControl>
              </HStack>
            </Box>
          </VStack>
        </Box>
      </Collapse>

      {isLoading && (
        <Alert status="info" borderRadius="md" mt={4}>
          <AlertIcon />
          <Text fontSize="sm">Aplicando filtros...</Text>
        </Alert>
      )}
    </Box>
  );
};

export default FiltrosAvancados;
