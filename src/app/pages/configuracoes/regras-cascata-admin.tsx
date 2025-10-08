import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  useToast,
  IconButton,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Flex,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Divider,
} from '@chakra-ui/react';
import {
  FiEdit,
  FiTrash2,
  FiPlusCircle,
  FiEye,
  FiEyeOff,
  FiSave,
  FiRefreshCw,
} from 'react-icons/fi';
import {
  useGetRegrasCascata,
  useCreateRegraCascata,
  useUpdateRegraCascata,
  useToggleAtivaRegraCascata,
  useDeleteRegraCascata,
} from '../../services/regras-cascata/regras-cascata.service.hooks';
import { RegraCascataRequest, CombinacaoRegra } from '../../services/regras-cascata/regras-cascata.service';
import EditorCombinacoes from '../../components/EditorCombinacoes';
import { Combinacao } from '../../components/EditorCombinacoes/EditorCombinacoes';
import { 
  useGetNiveisEnsino, 
  useGetTiposTurma, 
  useGetTiposProfessor, 
  useGetTiposDisciplina, 
  useGetTiposMatricula 
} from '../../services/lookup/lookup.service.hooks';

const RegrasCascataAdmin: React.FC = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modoEdicao, setModoEdicao] = useState<'criar' | 'editar'>('criar');
  const [regraEmEdicao, setRegraEmEdicao] = useState<RegraCascataRequest | null>(null);

  // Queries para buscar dados da API
  const { data: niveisEnsino = [] } = useGetNiveisEnsino();
  const { data: tiposTurma = [] } = useGetTiposTurma();
  const { data: tiposProfessor = [] } = useGetTiposProfessor();
  const { data: tiposDisciplina = [] } = useGetTiposDisciplina();
  const { data: tiposMatricula = [] } = useGetTiposMatricula();

  // Função para obter opções baseadas no tipo - agora usando dados da API
  const obterOpcoesPorTipo = (tipo: string): string[] => {
    switch (tipo.toLowerCase()) {
      case 'nivelensino':
        return niveisEnsino.map(nivel => nivel.nome);
      
      case 'tipoturma':
        return tiposTurma.map(tipo => tipo.nome);
      
      case 'tipoprofessor':
        return tiposProfessor.map(tipo => tipo.nome);
      
      case 'tipodisciplina':
        return tiposDisciplina.map(tipo => tipo.nome);
      
      case 'tipomatricula':
        return tiposMatricula.map(tipo => tipo.nome);
      
      case 'itemavaliado':
        return ['Disciplina', 'Curso', 'Turma', 'Professor', 'Coordenador'];
      
      default:
        return ['Opção 1', 'Opção 2', 'Opção 3']; // Fallback genérico
    }
  };

  // Queries e Mutations
  const { data: regras, isLoading, error, refetch } = useGetRegrasCascata(false); // Busca todas (ativas e inativas)
  const createMutation = useCreateRegraCascata();
  const updateMutation = useUpdateRegraCascata();
  const toggleAtivaMutation = useToggleAtivaRegraCascata();
  const deleteMutation = useDeleteRegraCascata();

  // Handlers
  const handleNovaRegra = () => {
    setModoEdicao('criar');
    setRegraEmEdicao({
      nome: '',
      descricao: '',
      identificador: '',
      ativa: true,
      tipoOrigem: '',
      tipoDestino: '',
      combinacoes: [],
      ordem: (regras?.length || 0) + 1,
    });
    onOpen();
  };

  const handleEditarRegra = (regra: any) => {
    setModoEdicao('editar');
    setRegraEmEdicao({
      id: regra.id,
      nome: regra.nome,
      descricao: regra.descricao,
      identificador: regra.identificador,
      ativa: regra.ativa,
      tipoOrigem: regra.tipoOrigem,
      tipoDestino: regra.tipoDestino,
      combinacoes: regra.combinacoes,
      ordem: regra.ordem,
    });
    onOpen();
  };

  const handleSalvarRegra = async () => {
    if (!regraEmEdicao) return;

    console.log('🔍 Salvando regra:', regraEmEdicao);
    console.log('🔍 Modo:', modoEdicao);

    try {
      if (modoEdicao === 'criar') {
        await createMutation.mutateAsync(regraEmEdicao);
        toast({
          title: 'Regra criada',
          description: 'A regra foi criada com sucesso!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await updateMutation.mutateAsync({
          id: regraEmEdicao.id!,
          regra: regraEmEdicao,
        });
        toast({
          title: 'Regra atualizada',
          description: 'A regra foi atualizada com sucesso!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      onClose();
      setRegraEmEdicao(null);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error?.response?.data?.message || 'Erro ao salvar regra',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleToggleAtiva = async (id: number) => {
    try {
      const result = await toggleAtivaMutation.mutateAsync(id);
      toast({
        title: result.ativa ? 'Regra ativada' : 'Regra desativada',
        description: `A regra foi ${result.ativa ? 'ativada' : 'desativada'} com sucesso!`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error?.response?.data?.message || 'Erro ao alterar status da regra',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleExcluirRegra = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta regra? Ela será desativada (soft delete).')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: 'Regra excluída',
        description: 'A regra foi excluída com sucesso!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error?.response?.data?.message || 'Erro ao excluir regra',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Carregando regras em cascata...</Text>
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <AlertTitle>Erro ao carregar regras</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <HStack justify="space-between" mb={4}>
            <VStack align="start" spacing={1}>
              <Heading size="lg" color="gray.700">
                Regras em Cascata Globais
              </Heading>
              <Text color="gray.600" fontSize="sm">
                Configure as regras de combinação aplicadas em todas as avaliações da instituição
              </Text>
            </VStack>
            <HStack>
              <Tooltip label="Recarregar">
                <IconButton
                  aria-label="Recarregar"
                  icon={<FiRefreshCw />}
                  variant="outline"
                  colorScheme="blue"
                  onClick={() => refetch()}
                />
              </Tooltip>
              <Button
                leftIcon={<FiPlusCircle />}
                colorScheme="blue"
                onClick={handleNovaRegra}
              >
                Nova Regra
              </Button>
            </HStack>
          </HStack>

          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <Box flex="1">
              <AlertTitle fontSize="sm">Sobre as Regras em Cascata</AlertTitle>
              <AlertDescription fontSize="xs">
                Estas regras definem quais combinações são válidas entre diferentes tipos (ex: "EAD não permite Professor Titular").
                Elas são aplicadas em <strong>TODAS as avaliações</strong> e representam políticas institucionais.
              </AlertDescription>
            </Box>
          </Alert>
        </Box>

        {/* Lista de Regras */}
        {!regras || regras.length === 0 ? (
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <AlertTitle>Nenhuma regra encontrada</AlertTitle>
            <AlertDescription>
              Clique em "Nova Regra" para criar sua primeira regra em cascata.
            </AlertDescription>
          </Alert>
        ) : (
          <Accordion allowMultiple>
            {regras
              .sort((a, b) => a.ordem - b.ordem)
              .map((regra) => (
                <AccordionItem key={regra.id} border="1px solid" borderColor="gray.200" borderRadius="md" mb={3}>
                  <h2>
                    <AccordionButton _expanded={{ bg: 'blue.50' }}>
                      <Flex flex="1" align="center" gap={3}>
                        <Badge colorScheme={regra.ativa ? 'green' : 'red'}>
                          {regra.ativa ? 'Ativa' : 'Inativa'}
                        </Badge>
                        <Text fontWeight="bold" flex="1" textAlign="left">
                          {regra.nome}
                        </Text>
                        <Badge colorScheme="purple" fontSize="xs">
                          {regra.tipoOrigem} → {regra.tipoDestino}
                        </Badge>
                        <Badge colorScheme="gray" fontSize="xs">
                          Ordem: {regra.ordem}
                        </Badge>
                      </Flex>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <VStack align="stretch" spacing={4}>
                      {/* Informações */}
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={2}>
                          <strong>Identificador:</strong> {regra.identificador}
                        </Text>
                        {regra.descricao && (
                          <Text fontSize="sm" color="gray.600">
                            <strong>Descrição:</strong> {regra.descricao}
                          </Text>
                        )}
                      </Box>

                      {/* Combinações */}
                      <Box>
                        <Text fontSize="sm" fontWeight="bold" mb={2}>
                          Combinações ({regra.combinacoes.length}):
                        </Text>
                        <VStack align="stretch" spacing={2}>
                          {regra.combinacoes.map((comb) => (
                            <HStack
                              key={comb.id}
                              p={2}
                              bg={comb.permitido ? 'green.50' : 'red.50'}
                              borderRadius="md"
                              fontSize="sm"
                            >
                              <Badge colorScheme={comb.permitido ? 'green' : 'red'}>
                                {comb.permitido ? '✓' : '✗'}
                              </Badge>
                              <Text flex="1">
                                <strong>{comb.origem}</strong> → {comb.destino.join(', ')}
                              </Text>
                            </HStack>
                          ))}
                        </VStack>
                      </Box>

                      {/* Ações */}
                      <HStack justify="flex-end" pt={2} borderTop="1px solid" borderColor="gray.200">
                        <Tooltip label={regra.ativa ? 'Desativar regra' : 'Ativar regra'}>
                          <IconButton
                            aria-label="Toggle ativa"
                            icon={regra.ativa ? <FiEyeOff /> : <FiEye />}
                            size="sm"
                            variant="ghost"
                            colorScheme={regra.ativa ? 'orange' : 'green'}
                            onClick={() => handleToggleAtiva(regra.id)}
                          />
                        </Tooltip>
                        <Tooltip label="Editar regra">
                          <IconButton
                            aria-label="Editar"
                            icon={<FiEdit />}
                            size="sm"
                            variant="ghost"
                            colorScheme="blue"
                            onClick={() => handleEditarRegra(regra)}
                          />
                        </Tooltip>
                        <Tooltip label="Excluir regra">
                          <IconButton
                            aria-label="Excluir"
                            icon={<FiTrash2 />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => handleExcluirRegra(regra.id)}
                          />
                        </Tooltip>
                      </HStack>
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              ))}
          </Accordion>
        )}
      </VStack>

      {/* Modal de Criação/Edição */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {modoEdicao === 'criar' ? 'Nova Regra em Cascata' : 'Editar Regra em Cascata'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {regraEmEdicao && (
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Nome da Regra</FormLabel>
                  <Input
                    value={regraEmEdicao.nome}
                    onChange={(e) =>
                      setRegraEmEdicao({ ...regraEmEdicao, nome: e.target.value })
                    }
                    placeholder="Ex: Nível de Ensino × Tipo de Professor"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Descrição</FormLabel>
                  <Textarea
                    value={regraEmEdicao.descricao || ''}
                    onChange={(e) =>
                      setRegraEmEdicao({ ...regraEmEdicao, descricao: e.target.value })
                    }
                    placeholder="Descrição detalhada da regra"
                    rows={2}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Identificador (único)</FormLabel>
                  <Input
                    value={regraEmEdicao.identificador}
                    onChange={(e) =>
                      setRegraEmEdicao({ ...regraEmEdicao, identificador: e.target.value })
                    }
                    placeholder="Ex: nivel-ensino-tipo-professor"
                  />
                </FormControl>

                <HStack>
                  <FormControl isRequired flex="1">
                    <FormLabel fontSize="sm">Tipo de Origem</FormLabel>
                    <Input
                      value={regraEmEdicao.tipoOrigem}
                      onChange={(e) =>
                        setRegraEmEdicao({ ...regraEmEdicao, tipoOrigem: e.target.value })
                      }
                      placeholder="Ex: NivelEnsino"
                    />
                  </FormControl>

                  <FormControl isRequired flex="1">
                    <FormLabel fontSize="sm">Tipo de Destino</FormLabel>
                    <Input
                      value={regraEmEdicao.tipoDestino}
                      onChange={(e) =>
                        setRegraEmEdicao({ ...regraEmEdicao, tipoDestino: e.target.value })
                      }
                      placeholder="Ex: TipoProfessor"
                    />
                  </FormControl>
                </HStack>

                <HStack>
                  <FormControl display="flex" alignItems="center">
                    <FormLabel fontSize="sm" mb="0">
                      Regra ativa?
                    </FormLabel>
                    <Switch
                      isChecked={regraEmEdicao.ativa}
                      onChange={(e) =>
                        setRegraEmEdicao({ ...regraEmEdicao, ativa: e.target.checked })
                      }
                      colorScheme="green"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm">Ordem</FormLabel>
                    <NumberInput
                      value={regraEmEdicao.ordem}
                      onChange={(_, value) =>
                        setRegraEmEdicao({ ...regraEmEdicao, ordem: value })
                      }
                      min={0}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>

                <Divider />
                
                {/* Editor Visual de Combinações */}
                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={3}>
                    Combinações da Regra
                  </Text>
                  <EditorCombinacoes
                    combinacoes={regraEmEdicao.combinacoes.map(comb => ({
                      id: comb.id,
                      origem: comb.origem,
                      destino: comb.destino,
                      permitido: comb.permitido,
                      opcoes: comb.opcoes
                    }))}
                    onCombinacoesChange={(novasCombinacoes: Combinacao[]) => {
                      if (!regraEmEdicao) return;
                      setRegraEmEdicao({
                        ...regraEmEdicao,
                        combinacoes: novasCombinacoes.map(comb => ({
                          id: comb.id,
                          origem: comb.origem,
                          destino: comb.destino,
                          permitido: comb.permitido,
                          opcoes: comb.opcoes
                        }))
                      });
                    }}
                    tipoOrigem={regraEmEdicao.tipoOrigem}
                    tipoDestino={regraEmEdicao.tipoDestino}
                    opcoesOrigem={obterOpcoesPorTipo(regraEmEdicao.tipoOrigem)}
                    opcoesDestino={obterOpcoesPorTipo(regraEmEdicao.tipoDestino)}
                    isLoading={createMutation.isPending || updateMutation.isPending}
                  />
                </Box>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button
              colorScheme="blue"
              leftIcon={<FiSave />}
              onClick={handleSalvarRegra}
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              Salvar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default RegrasCascataAdmin;

