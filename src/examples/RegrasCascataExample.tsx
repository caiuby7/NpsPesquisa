import React from 'react';
import { Box, VStack, Text, Button } from '@chakra-ui/react';
import RegrasFiltroQuestionario from '../components/RegrasFiltroQuestionario';

// Exemplo de como usar o componente RegrasFiltroQuestionario
// em uma tela de criar/editar avaliação

interface ExemploCriarAvaliacaoProps {
  questionarioId?: number; // Para edição, undefined para criação
}

export const ExemploCriarAvaliacao: React.FC<ExemploCriarAvaliacaoProps> = ({ 
  questionarioId 
}) => {
  // Estado para regras de filtro (existente no sistema)
  const [regrasFiltro, setRegrasFiltro] = React.useState({
    aplicarFiltroContextoAluno: false,
    contextoAlunoPermitido: 'Ambos',
    tiposProfessorPermitidos: [] as string[],
    tiposDisciplinaPermitidos: [] as string[],
    tiposTurmaPermitidos: [] as string[],
    statusMatriculaPermitidos: [] as string[],
    niveisEnsinoPermitidos: [] as string[],
    incluirTurmasGerenciadas: true,
    incluirTurmasNaoGerenciadas: true
  });

  const handleRegrasChange = (novasRegras: typeof regrasFiltro) => {
    setRegrasFiltro(novasRegras);
    console.log('Regras de filtro atualizadas:', novasRegras);
  };

  const handleSalvarRegras = () => {
    console.log('Regras em cascata salvas!');
    // Aqui você pode adicionar lógica adicional após salvar
    // Por exemplo, atualizar a lista de questionários, mostrar notificação, etc.
  };

  const handleSalvarQuestionario = async () => {
    // Exemplo de como salvar o questionário completo
    const questionarioData = {
      titulo: "Avaliação Exemplo",
      descricao: "Descrição da avaliação",
      // ... outros campos
      regrasFiltro,
      // As regras em cascata já são salvas automaticamente pelo componente
    };

    console.log('Dados do questionário para salvar:', questionarioData);
    
    // Fazer requisição para salvar o questionário
    // const response = await fetch('/api/Questionario/com-questoes', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(questionarioData)
    // });
  };

  return (
    <Box p={6} maxW="1200px" mx="auto">
      <VStack spacing={6} align="stretch">
        <Box>
          <Text fontSize="2xl" fontWeight="bold" mb={2}>
            {questionarioId ? 'Editar Avaliação' : 'Criar Nova Avaliação'}
          </Text>
          <Text color="gray.600">
            Configure as regras de filtro e combinações para sua avaliação.
          </Text>
        </Box>

        {/* Componente de Regras em Cascata */}
        <RegrasFiltroQuestionario
          regras={regrasFiltro}
          onRegrasChange={handleRegrasChange}
          questionarioId={questionarioId} // Passar o ID para habilitar salvamento
          onSalvarRegras={handleSalvarRegras}
          isLoading={false}
        />

        {/* Botão para salvar questionário completo */}
        <Box pt={4} borderTop="1px solid" borderColor="gray.200">
          <Button
            colorScheme="green"
            size="lg"
            onClick={handleSalvarQuestionario}
            width="100%"
          >
            {questionarioId ? 'Atualizar Avaliação' : 'Criar Avaliação'}
          </Button>
        </Box>
      </VStack>
    </Box>
  );
};

export default ExemploCriarAvaliacao;

