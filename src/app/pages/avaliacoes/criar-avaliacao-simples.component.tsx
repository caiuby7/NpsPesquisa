import React, { useState } from 'react';
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
  Divider
} from '@chakra-ui/react';
import { Send, Users } from 'lucide-react';
import { TipoQuestionarioEnum } from '../../services/form/form.services.types';
import RegrasCascata from '../../../components/RegrasCascata/regras-cascata.component';
import { useRegrasCascata } from '../../../hooks/useRegrasCascata';

const CriarAvaliacaoSimples: React.FC = () => {
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

  const toast = useToast();

  const handleRegrasFiltroChange = (novasRegras: any) => {
    setRegrasFiltro(novasRegras);
  };

  const handleNextStep = () => {
    toast({
      title: "Regras de Cascata Configuradas",
      description: "As regras foram salvas com sucesso!",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    
    // Aqui você pode adicionar a lógica para ir para o próximo passo
    console.log('Regras configuradas:', regrasFiltro);
  };

  return (
    <Box p={6} maxW="1200px" mx="auto">
      <Heading size="lg" mb={6} color="blue.600">
        <HStack>
          <Users size={28} />
          <Text>Configuração de Regras de Cascata</Text>
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

            {/* Botão de Próximo */}
            <Box pt={4}>
              <HStack justify="flex-end">
                <Button
                  leftIcon={<Send size={20} />}
                  colorScheme="green"
                  onClick={handleNextStep}
                  size="lg"
                >
                  Salvar e Continuar
                </Button>
              </HStack>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default CriarAvaliacaoSimples;
