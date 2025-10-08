import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Checkbox,
  CheckboxGroup,
  Select,
  Button,
  Heading,
  useToast,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Badge,
  SimpleGrid,
  FormControl,
  FormLabel,
  Switch,
  Wrap,
  WrapItem,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { ENVIRONMENT } from '../../config/environment';
import type { RegraCascata, CombinacaoRegra } from '../../hooks/useRegrasCascata';

interface RegrasCascataProps {
  regras: RegraCascata[];
  onRegrasChange: (regras: RegraCascata[]) => void;
  opcoesFiltradas: {
    niveisEnsino: string[];
    tiposTurma: string[];
    tiposProfessor: string[];
    tiposDisciplina: string[];
    tiposMatricula: string[];
    tiposAvaliado: string[];
  };
  isLoading?: boolean;
}

const RegrasCascata: React.FC<RegrasCascataProps> = ({
  regras,
  onRegrasChange,
  opcoesFiltradas,
  isLoading = false
}) => {
  const toast = useToast();
  const [opcoes, setOpcoes] = useState({
    niveisEnsino: opcoesFiltradas.niveisEnsino.map(n => ({ value: n, label: n })),
    tiposTurma: opcoesFiltradas.tiposTurma.map(t => ({ value: t, label: t })),
    tiposProfessor: opcoesFiltradas.tiposProfessor.map(p => ({ value: p, label: p })),
    tiposDisciplina: opcoesFiltradas.tiposDisciplina.map(d => ({ value: d, label: d })),
    tiposMatricula: opcoesFiltradas.tiposMatricula.map(m => ({ value: m, label: m })),
    tiposAvaliado: opcoesFiltradas.tiposAvaliado.map(a => ({ value: a, label: a }))
  });

  // Atualizar opções quando opcoesFiltradas mudar
  useEffect(() => {
    console.log('🔄 RegrasCascata - Atualizando opções:', opcoesFiltradas);
    setOpcoes({
      niveisEnsino: opcoesFiltradas.niveisEnsino.map(n => ({ value: n, label: n })),
      tiposTurma: opcoesFiltradas.tiposTurma.map(t => ({ value: t, label: t })),
      tiposProfessor: opcoesFiltradas.tiposProfessor.map(p => ({ value: p, label: p })),
      tiposDisciplina: opcoesFiltradas.tiposDisciplina.map(d => ({ value: d, label: d })),
      tiposMatricula: opcoesFiltradas.tiposMatricula.map(m => ({ value: m, label: m })),
      tiposAvaliado: opcoesFiltradas.tiposAvaliado.map(a => ({ value: a, label: a }))
    });
  }, [opcoesFiltradas]);

  const [regrasLocais, setRegrasLocais] = useState<RegraCascata[]>(regras);

  useEffect(() => {
    setRegrasLocais(regras);
  }, [regras]);

  const handleRegraChange = (regraId: string, field: keyof RegraCascata, value: any) => {
    const novasRegras = regrasLocais.map(regra => 
      regra.id === regraId 
        ? { ...regra, [field]: value }
        : regra
    );
    setRegrasLocais(novasRegras);
    onRegrasChange(novasRegras);
  };

  const handleCombinacaoChange = (regraId: string, combinacaoId: string, field: keyof CombinacaoRegra, value: any) => {
    const novasRegras = regrasLocais.map(regra => 
      regra.id === regraId 
        ? {
            ...regra,
            combinacoes: regra.combinacoes.map(combinacao =>
              combinacao.id === combinacaoId
                ? { ...combinacao, [field]: value }
                : combinacao
            )
          }
        : regra
    );
    setRegrasLocais(novasRegras);
    onRegrasChange(novasRegras);
  };

  const adicionarCombinacao = (regraId: string) => {
    const novasRegras = regrasLocais.map(regra => 
      regra.id === regraId 
        ? {
            ...regra,
            combinacoes: [
              ...regra.combinacoes,
              {
                id: `combinacao-${Date.now()}`,
                origem: '',
                destino: '',
                permitido: true,
                opcoes: []
              }
            ]
          }
        : regra
    );
    setRegrasLocais(novasRegras);
    onRegrasChange(novasRegras);
  };

  const removerCombinacao = (regraId: string, combinacaoId: string) => {
    const novasRegras = regrasLocais.map(regra => 
      regra.id === regraId 
        ? {
            ...regra,
            combinacoes: regra.combinacoes.filter(c => c.id !== combinacaoId)
          }
        : regra
    );
    setRegrasLocais(novasRegras);
    onRegrasChange(novasRegras);
  };

  const renderCombinacao = (regra: RegraCascata, combinacao: CombinacaoRegra) => {
    // Definir opções baseado no ID específico da regra para maior precisão
    let opcoesOrigem: Array<{ value: string; label: string }> = [];
    let opcoesDestino: Array<{ value: string; label: string }> = [];

    switch (regra.id) {
      case 'nivel-ensino-tipo-professor':
        opcoesOrigem = opcoes.niveisEnsino;
        opcoesDestino = opcoes.tiposProfessor;
        break;
      case 'nivel-ensino-tipo-matricula':
        opcoesOrigem = opcoes.niveisEnsino;
        opcoesDestino = opcoes.tiposMatricula;
        break;
      case 'nivel-ensino-tipo-turma':
        opcoesOrigem = opcoes.niveisEnsino;
        opcoesDestino = opcoes.tiposTurma;
        break;
      case 'nivel-ensino-tipo-disciplina':
        opcoesOrigem = opcoes.niveisEnsino;
        opcoesDestino = opcoes.tiposDisciplina;
        break;
      case 'tipo-turma-tipo-disciplina':
        opcoesOrigem = opcoes.tiposTurma;
        opcoesDestino = opcoes.tiposDisciplina;
        break;
      case 'tipo-turma-tipo-professor':
        opcoesOrigem = opcoes.tiposTurma;
        opcoesDestino = opcoes.tiposProfessor;
        break;
      case 'item-avaliado-tipo-professor':
        opcoesOrigem = opcoes.tiposAvaliado;
        opcoesDestino = opcoes.tiposProfessor;
        break;
      case 'item-avaliado-tipo-turma':
        opcoesOrigem = opcoes.tiposAvaliado;
        opcoesDestino = opcoes.tiposTurma;
        break;
      case 'item-avaliado-tipo-disciplina':
        opcoesOrigem = opcoes.tiposAvaliado;
        opcoesDestino = opcoes.tiposDisciplina;
        break;
      case 'item-avaliado-tipo-matricula':
        opcoesOrigem = opcoes.tiposAvaliado;
        opcoesDestino = opcoes.tiposMatricula;
        break;
      default:
        // Fallback para a lógica antiga se houver regras não mapeadas
        opcoesOrigem = regra.nome.includes('Nível de Ensino') ? opcoes.niveisEnsino :
                      regra.nome.includes('Tipo de Turma') ? opcoes.tiposTurma :
                      regra.nome.includes('Tipo de Disciplina') ? opcoes.tiposDisciplina :
                      regra.nome.includes('Tipo de Matrícula') ? opcoes.tiposMatricula :
                      regra.nome.includes('Item Avaliado') ? opcoes.tiposAvaliado : [];

        opcoesDestino = regra.nome.includes('Tipo de Turma') ? opcoes.tiposTurma :
                       regra.nome.includes('Tipo de Professor') ? opcoes.tiposProfessor :
                       regra.nome.includes('Tipo de Disciplina') ? opcoes.tiposDisciplina :
                       regra.nome.includes('Tipo de Matrícula') ? opcoes.tiposMatricula :
                       regra.nome.includes('Item Avaliado') ? opcoes.tiposAvaliado : [];
        break;
    }

    // Converter destino para array para multiselect
    const destinoSelecionado = Array.isArray(combinacao.destino) ? 
      combinacao.destino : 
      [combinacao.destino].filter(Boolean);

    return (
      <Card key={combinacao.id} size="sm" variant="outline">
        <CardBody>
          <HStack spacing={4} align="center">
            <FormControl flex={1}>
              <FormLabel fontSize="sm">Origem</FormLabel>
              <Select
                size="sm"
                value={combinacao.origem}
                onChange={(e) => handleCombinacaoChange(regra.id, combinacao.id, 'origem', e.target.value)}
              >
                <option value="">Selecione...</option>
                {opcoesOrigem.map(opcao => (
                  <option key={opcao.value} value={opcao.value}>
                    {opcao.label}
                  </option>
                ))}
              </Select>
            </FormControl>

            <Text fontSize="sm" fontWeight="bold">→</Text>

            <FormControl flex={1}>
              <FormLabel fontSize="sm">Destino</FormLabel>
              <CheckboxGroup
                value={destinoSelecionado}
                onChange={(values) => handleCombinacaoChange(regra.id, combinacao.id, 'destino', values)}
              >
                <Wrap spacing={2}>
                  {opcoesDestino.map(opcao => (
                    <WrapItem key={opcao.value}>
                      <Checkbox value={opcao.value} size="sm">
                        {opcao.label}
                      </Checkbox>
                    </WrapItem>
                  ))}
                </Wrap>
              </CheckboxGroup>
            </FormControl>

            <FormControl flex={1}>
              <FormLabel fontSize="sm">Permitido</FormLabel>
              <Switch
                isChecked={combinacao.permitido}
                onChange={(e) => handleCombinacaoChange(regra.id, combinacao.id, 'permitido', e.target.checked)}
                colorScheme={combinacao.permitido ? 'green' : 'red'}
              />
            </FormControl>

            <Button
              size="sm"
              colorScheme="red"
              variant="ghost"
              onClick={() => removerCombinacao(regra.id, combinacao.id)}
            >
              ✕
            </Button>
          </HStack>
        </CardBody>
      </Card>
    );
  };

  const renderRegra = (regra: RegraCascata) => (
    <Card key={regra.id} variant="outline">
      <CardHeader>
        <HStack justify="space-between">
          <HStack>
            <Switch
              isChecked={regra.ativa}
              onChange={(e) => handleRegraChange(regra.id, 'ativa', e.target.checked)}
              colorScheme="blue"
            />
            <Heading size="md">{regra.nome}</Heading>
            <Badge colorScheme={regra.ativa ? 'green' : 'gray'}>
              {regra.ativa ? 'Ativa' : 'Inativa'}
            </Badge>
          </HStack>
          <Button
            size="sm"
            colorScheme="blue"
            onClick={() => adicionarCombinacao(regra.id)}
          >
            + Adicionar Combinação
          </Button>
        </HStack>
      </CardHeader>
      
      <CardBody>
        <VStack spacing={3} align="stretch">
          {regra.combinacoes.length === 0 ? (
            <Alert status="info">
              <AlertIcon />
              Nenhuma combinação definida. Clique em "Adicionar Combinação" para começar.
            </Alert>
          ) : (
            regra.combinacoes.map(combinacao => renderCombinacao(regra, combinacao))
          )}
        </VStack>
      </CardBody>
    </Card>
  );

  if (isLoading) {
    return (
      <Box textAlign="center" py={8}>
        <Text>Carregando regras...</Text>
      </Box>
    );
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>Regras em Cascata</Heading>
          <Text color="gray.600">
            Configure as regras de combinação entre diferentes tipos de dados.
            As regras são aplicadas em cascata: uma combinação afeta as opções disponíveis na próxima.
          </Text>
        </Box>

        <Divider />

        {regrasLocais.map(renderRegra)}

        <Box textAlign="center" py={4}>
          <Button
            colorScheme="green"
            onClick={() => {
              toast({
                title: 'Regras salvas',
                description: 'Todas as regras foram salvas com sucesso!',
                status: 'success',
                duration: 3000,
                isClosable: true,
              });
            }}
          >
            Salvar Todas as Regras
          </Button>
        </Box>
      </VStack>
    </Box>
  );
};

export default RegrasCascata;
