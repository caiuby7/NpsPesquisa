import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Spinner,
  Alert,
  AlertIcon,
  Button,
  useDisclosure
} from '@chakra-ui/react';
import { RegrasCascata } from '../RegrasCascata';
import { useRegrasCascata } from '../../hooks/useRegrasCascata';
import { useRegrasCascataForm } from '../../hooks/useRegrasCascataForm';

interface RegrasFiltroQuestionarioProps {
  regras: RegrasFiltro;
  onRegrasChange: (regras: RegrasFiltro) => void;
  isLoading?: boolean;
  questionarioId?: number;
  onSalvarRegras?: () => void;
}

interface RegrasFiltro {
  aplicarFiltroContextoAluno: boolean;
  contextoAlunoPermitido: string;
  tiposProfessorPermitidos: string[];
  tiposDisciplinaPermitidos: string[];
  tiposTurmaPermitidos: string[];
  statusMatriculaPermitidos: string[];
  niveisEnsinoPermitidos: string[];
  incluirTurmasGerenciadas: boolean;
  incluirTurmasNaoGerenciadas: boolean;
}

interface OpcoesFiltro {
  tiposDisciplina: Array<{ value: string; label: string }>;
  tiposProfessor: Array<{ value: string; label: string }>;
  tiposTurma: Array<{ value: string; label: string }>;
  statusMatricula: Array<{ value: string; label: string }>;
  contextoAluno: Array<{ value: string; label: string }>;
  niveisEnsino: Array<{ value: string; label: string }>;
}

const RegrasFiltroQuestionario: React.FC<RegrasFiltroQuestionarioProps> = ({
  regras,
  onRegrasChange,
  isLoading = false,
  questionarioId,
  onSalvarRegras
}) => {
  const { regras: regrasCascata, opcoesFiltradas } = useRegrasCascata();
  const [carregandoOpcoes, setCarregandoOpcoes] = React.useState(false);
  
  // Hook para gerenciar o salvamento das regras
  const {
    regras: regrasForm,
    salvarRegras,
    carregando: salvandoRegras,
    hasChanges,
    resetRegras
  } = useRegrasCascataForm({
    regrasIniciais: regrasCascata,
    questionarioId,
    onRegrasChange: (novasRegras) => {
      console.log('Regras em cascata atualizadas:', novasRegras);
    }
  });

  // Simular carregamento
  React.useEffect(() => {
    setCarregandoOpcoes(false);
  }, []);

  if (carregandoOpcoes) {
    return (
      <Box p={6} bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.200">
        <HStack spacing={3} justify="center">
          <Spinner size="sm" color="blue.500" />
          <Text color="gray.600">Carregando opções de filtro...</Text>
        </HStack>
      </Box>
    );
  }

  return (
    <Box p={6} bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.200">
      <VStack spacing={6} align="stretch">
        <Box>
          <HStack spacing={3} mb={4}>
            <Box w={8} h={8} bg="blue.500" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
              <Text color="white" fontSize="sm" fontWeight="bold">🔧</Text>
            </Box>
            <Heading size="md" color="gray.700">
              Regras em Cascata
            </Heading>
          </HStack>
          <Text color="gray.600" fontSize="sm" mb={4}>
            Configure as regras de combinação entre diferentes tipos de dados. As regras são aplicadas em cascata.
          </Text>
        </Box>
        
              <RegrasCascata
                regras={regrasForm}
                onRegrasChange={(novasRegras) => {
                  console.log('Regras em cascata atualizadas:', novasRegras);
                }}
                opcoesFiltradas={opcoesFiltradas}
                isLoading={isLoading || salvandoRegras}
              />

              {/* Botões de ação */}
              {questionarioId && (
                <HStack spacing={4} justify="flex-end" pt={4} borderTop="1px solid" borderColor="gray.200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetRegras}
                    isDisabled={!hasChanges || salvandoRegras}
                  >
                    Cancelar
                  </Button>
                  <Button
                    colorScheme="blue"
                    size="sm"
                    onClick={async () => {
                      await salvarRegras();
                      onSalvarRegras?.();
                    }}
                    isLoading={salvandoRegras}
                    loadingText="Salvando..."
                    isDisabled={!hasChanges}
                  >
                    Salvar Regras
                  </Button>
                </HStack>
              )}

              {(isLoading || salvandoRegras) && (
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Text fontSize="sm">
                    {salvandoRegras ? 'Salvando regras em cascata...' : 'Carregando configurações...'}
                  </Text>
                </Alert>
              )}
      </VStack>
    </Box>
  );
};

export default RegrasFiltroQuestionario;