import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Text, 
  useToast,
  VStack,
  HStack,
  Heading,
  Card,
  CardHeader,
  CardBody,
  Divider,
  Spinner,
  Center
} from '@chakra-ui/react';
import { Save, Edit3 } from 'lucide-react';
import { TipoQuestionarioEnum } from '../../services/form/form.services.types';
import RegrasCascata from '../../../components/RegrasCascata/regras-cascata.component';
import { useRegrasCascata } from '../../../hooks/useRegrasCascata';
import { api } from '../../services/api';

interface EditarAvaliacaoSimplesProps {
  avaliacaoId: string;
}

const EditarAvaliacaoSimples: React.FC<EditarAvaliacaoSimplesProps> = ({ avaliacaoId }) => {
  const { regras, opcoesFiltradas } = useRegrasCascata();
  
  const [regrasFiltro, setRegrasFiltro] = useState({
    aplicarFiltroContextoAluno: false,
    contextoAlunoPermitido: 'Ambos',
    tiposProfessorPermitidos: [],
    tiposDisciplinaPermitidos: [],
    tiposTurmaPermitidos: [],
    statusMatriculaPermitidos: [],
    niveisEnsinoPermitidos: [],
    incluirTurmasGerenciadas: true,
    incluirTurmasNaoGerenciadas: true
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avaliacao, setAvaliacao] = useState<any>(null);

  const toast = useToast();

  useEffect(() => {
    carregarAvaliacao();
  }, [avaliacaoId]);

  const carregarAvaliacao = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/Questionario/${avaliacaoId}`);
      const avaliacaoData = response.data;
      
      setAvaliacao(avaliacaoData);
      
      // Carregar regras existentes
      setRegrasFiltro({
        aplicarFiltroContextoAluno: avaliacaoData.aplicarFiltroContextoAluno || false,
        contextoAlunoPermitido: avaliacaoData.contextoAlunoPermitido || 'Ambos',
        tiposProfessorPermitidos: avaliacaoData.tiposProfessorPermitidos ? JSON.parse(avaliacaoData.tiposProfessorPermitidos) : [],
        tiposDisciplinaPermitidos: avaliacaoData.tiposDisciplinaPermitidos ? JSON.parse(avaliacaoData.tiposDisciplinaPermitidos) : [],
        tiposTurmaPermitidos: avaliacaoData.tiposTurmaPermitidos ? JSON.parse(avaliacaoData.tiposTurmaPermitidos) : [],
        statusMatriculaPermitidos: avaliacaoData.statusMatriculaPermitidos ? JSON.parse(avaliacaoData.statusMatriculaPermitidos) : [],
        niveisEnsinoPermitidos: avaliacaoData.niveisEnsinoPermitidos ? JSON.parse(avaliacaoData.niveisEnsinoPermitidos) : [],
        incluirTurmasGerenciadas: avaliacaoData.incluirTurmasGerenciadas || true,
        incluirTurmasNaoGerenciadas: avaliacaoData.incluirTurmasNaoGerenciadas || true
      });
    } catch (error) {
      console.error('Erro ao carregar avaliação:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar os dados da avaliação",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegrasFiltroChange = (novasRegras: any) => {
    setRegrasFiltro(novasRegras);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const dadosAtualizados = {
        tiposDisciplinaPermitidos: JSON.stringify(regrasFiltro.tiposDisciplinaPermitidos),
        tiposProfessorPermitidos: JSON.stringify(regrasFiltro.tiposProfessorPermitidos),
        tiposTurmaPermitidos: JSON.stringify(regrasFiltro.tiposTurmaPermitidos),
        niveisEnsinoPermitidos: JSON.stringify(regrasFiltro.niveisEnsinoPermitidos),
        aplicarFiltroContextoAluno: regrasFiltro.aplicarFiltroContextoAluno,
        contextoAlunoPermitido: regrasFiltro.contextoAlunoPermitido,
        incluirTurmasGerenciadas: regrasFiltro.incluirTurmasGerenciadas,
        incluirTurmasNaoGerenciadas: regrasFiltro.incluirTurmasNaoGerenciadas
      };

      await api.put(`/Questionario/${avaliacaoId}`, dadosAtualizados);
      
      toast({
        title: "Sucesso",
        description: "Regras de cascata atualizadas com sucesso!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar as regras de cascata",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Center h="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Carregando dados da avaliação...</Text>
        </VStack>
      </Center>
    );
  }

  if (!avaliacao) {
    return (
      <Box p={6} maxW="1200px" mx="auto">
        <Text>Avaliação não encontrada</Text>
      </Box>
    );
  }

  return (
    <Box p={6} maxW="1200px" mx="auto">
      <Heading size="lg" mb={6} color="blue.600">
        <HStack>
          <Edit3 size={28} />
          <Text>Editar Regras de Cascata - {avaliacao.titulo}</Text>
        </HStack>
      </Heading>

      <Card>
        <CardHeader>
          <Heading size="md" color="blue.600">
            Regras de Cascata para Avaliação Institucional
          </Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={6} align="stretch">
            {/* Regras de Cascata */}
            <Box>
              <RegrasCascata
                regras={regras}
                onRegrasChange={(novasRegras) => {
                  console.log('Regras em cascata atualizadas:', novasRegras);
                }}
                opcoesFiltradas={opcoesFiltradas}
                isLoading={false}
              />
            </Box>

            <Divider />

            {/* Botão de Salvar */}
            <Box pt={4}>
              <HStack justify="flex-end">
                <Button
                  leftIcon={<Save size={20} />}
                  colorScheme="green"
                  onClick={handleSave}
                  isLoading={saving}
                  loadingText="Salvando..."
                  size="lg"
                >
                  Salvar Alterações
                </Button>
              </HStack>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default EditarAvaliacaoSimples;
