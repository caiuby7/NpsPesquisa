import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Checkbox,
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
  Alert,
  AlertIcon,
  Collapse,
  IconButton
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';

interface SelecaoProgressivaProps {
  onSelecoesChange: (selecoes: SelecoesProgressivas) => void;
  isLoading?: boolean;
}

interface SelecoesProgressivas {
  nivelEnsino: string[];
  tiposTurma: {
    [nivel: string]: string[];
  };
  tiposProfessorPorTurma: {
    [nivel: string]: {
      [tipoTurma: string]: string[];
    };
  };
  tipoAvaliado: string[];
  tiposProfessorPorAvaliado: {
    [tipoAvaliado: string]: string[];
  };
}

const SelecaoProgressiva: React.FC<SelecaoProgressivaProps> = ({
  onSelecoesChange,
  isLoading = false
}) => {
  const toast = useToast();
  
  const [selecoes, setSelecoes] = useState<SelecoesProgressivas>({
    nivelEnsino: [],
    tiposTurma: {},
    tiposProfessorPorTurma: {},
    tipoAvaliado: [],
    tiposProfessorPorAvaliado: {}
  });

  const [mostrarSecoes, setMostrarSecoes] = useState({
    nivelEnsino: true,
    tiposTurma: false,
    tiposProfessor: false,
    tipoAvaliado: false,
    tiposProfessorAvaliado: false
  });

  const opcoes = {
    niveisEnsino: [
      { value: 'Presencial', label: 'Presencial' },
      { value: 'EAD', label: 'EAD' }
    ],
    tiposTurma: {
      'Presencial': [
        { value: 'Presencial', label: 'Aulas presenciais' },
        { value: 'EAD', label: 'Aulas à distância' }
      ],
      'EAD': [
        { value: 'EAD', label: 'Aulas à distância' }
      ]
    },
    tiposProfessor: [
      { value: 'Titular', label: 'Titular' },
      { value: 'Tutor', label: 'Tutor' },
      { value: 'Coordenador', label: 'Coordenador' }
    ],
    tiposAvaliado: [
      { value: 'Disciplina', label: 'Disciplina' },
      { value: 'Curso', label: 'Curso' },
      { value: 'Turma', label: 'Turma' }
    ]
  };

  const handleNivelEnsinoChange = (nivel: string, checked: boolean) => {
    const novosNiveis = checked 
      ? [...selecoes.nivelEnsino, nivel]
      : selecoes.nivelEnsino.filter(n => n !== nivel);

    const novasSelecoes = {
      ...selecoes,
      nivelEnsino: novosNiveis,
      tiposTurma: {},
      tiposProfessorPorTurma: {}
    };

    // Limpar seleções dependentes
    if (!checked) {
      if ((novasSelecoes.tiposTurma as any)[nivel]) {
        delete (novasSelecoes.tiposTurma as any)[nivel];
      }
      if ((novasSelecoes.tiposProfessorPorTurma as any)[nivel]) {
        delete (novasSelecoes.tiposProfessorPorTurma as any)[nivel];
      }
    }

    setSelecoes(novasSelecoes);
    onSelecoesChange(novasSelecoes);

    // Mostrar próxima seção se houver seleções
    if (novosNiveis.length > 0) {
      setMostrarSecoes(prev => ({ ...prev, tiposTurma: true }));
    } else {
      setMostrarSecoes(prev => ({ 
        ...prev, 
        tiposTurma: false, 
        tiposProfessor: false 
      }));
    }
  };

  const handleTipoTurmaChange = (nivel: string, tipoTurma: string, checked: boolean) => {
    const tiposAtuais = (selecoes.tiposTurma as any)[nivel] || [];
    const novosTipos = checked 
      ? [...tiposAtuais, tipoTurma]
      : tiposAtuais.filter((t: string) => t !== tipoTurma);

    const novasSelecoes = {
      ...selecoes,
      tiposTurma: {
        ...selecoes.tiposTurma,
        [nivel]: novosTipos
      }
    };

    // Limpar tipos de professor se tipo de turma foi removido
    if (!checked) {
      delete novasSelecoes.tiposProfessorPorTurma[nivel]?.[tipoTurma];
    }

    setSelecoes(novasSelecoes);
    onSelecoesChange(novasSelecoes);

    // Mostrar seção de tipos de professor se houver seleções
    const temSelecoes = Object.values(novasSelecoes.tiposTurma).some(tipos => tipos.length > 0);
    if (temSelecoes) {
      setMostrarSecoes(prev => ({ ...prev, tiposProfessor: true }));
    }
  };

  const handleTipoProfessorChange = (nivel: string, tipoTurma: string, tipoProfessor: string, checked: boolean) => {
    const tiposAtuais = (selecoes.tiposProfessorPorTurma as any)[nivel]?.[tipoTurma] || [];
    const novosTipos = checked 
      ? [...tiposAtuais, tipoProfessor]
      : tiposAtuais.filter((t: string) => t !== tipoProfessor);

    const novasSelecoes = {
      ...selecoes,
      tiposProfessorPorTurma: {
        ...selecoes.tiposProfessorPorTurma,
        [nivel]: {
          ...(selecoes.tiposProfessorPorTurma as any)[nivel],
          [tipoTurma]: novosTipos
        }
      }
    };

    setSelecoes(novasSelecoes);
    onSelecoesChange(novasSelecoes);
  };

  const handleTipoAvaliadoChange = (tipoAvaliado: string, checked: boolean) => {
    const novosTipos = checked 
      ? [...selecoes.tipoAvaliado, tipoAvaliado]
      : selecoes.tipoAvaliado.filter(t => t !== tipoAvaliado);

    const novasSelecoes = {
      ...selecoes,
      tipoAvaliado: novosTipos
    };

    // Limpar tipos de professor se tipo avaliado foi removido
    if (!checked) {
      delete novasSelecoes.tiposProfessorPorAvaliado[tipoAvaliado];
    }

    setSelecoes(novasSelecoes);
    onSelecoesChange(novasSelecoes);

    // Mostrar seção de tipos de professor por avaliado
    if (novosTipos.length > 0) {
      setMostrarSecoes(prev => ({ ...prev, tiposProfessorAvaliado: true }));
    } else {
      setMostrarSecoes(prev => ({ ...prev, tiposProfessorAvaliado: false }));
    }
  };

  const handleTipoProfessorAvaliadoChange = (tipoAvaliado: string, tipoProfessor: string, checked: boolean) => {
    const tiposAtuais = selecoes.tiposProfessorPorAvaliado[tipoAvaliado] || [];
    const novosTipos = checked 
      ? [...tiposAtuais, tipoProfessor]
      : tiposAtuais.filter((t: string) => t !== tipoProfessor);

    const novasSelecoes = {
      ...selecoes,
      tiposProfessorPorAvaliado: {
        ...selecoes.tiposProfessorPorAvaliado,
        [tipoAvaliado]: novosTipos
      }
    };

    setSelecoes(novasSelecoes);
    onSelecoesChange(novasSelecoes);
  };

  const renderCheckboxGroup = (titulo: string, opcoes: any[], selecionados: string[], onChange: (value: string, checked: boolean) => void) => (
    <VStack align="stretch" spacing={2}>
      <Text fontWeight="bold" fontSize="sm" color="gray.700">{titulo}</Text>
      {opcoes.map(opcao => (
        <Checkbox
          key={opcao.value}
          isChecked={selecionados.includes(opcao.value)}
          onChange={(e) => onChange(opcao.value, e.target.checked)}
          colorScheme="blue"
        >
          {opcao.label}
        </Checkbox>
      ))}
    </VStack>
  );

  const renderSecao = (titulo: string, isOpen: boolean, onToggle: () => void, children: React.ReactNode) => (
    <Card variant="outline">
      <CardHeader>
        <HStack justify="space-between">
          <HStack>
            <IconButton
              aria-label={isOpen ? "Fechar" : "Abrir"}
              icon={isOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
              size="sm"
              variant="ghost"
              onClick={onToggle}
            />
            <Heading size="md">{titulo}</Heading>
            <Badge colorScheme={isOpen ? 'green' : 'gray'}>
              {isOpen ? 'Aberto' : 'Fechado'}
            </Badge>
          </HStack>
        </HStack>
      </CardHeader>
      <Collapse in={isOpen}>
        <CardBody>
          {children}
        </CardBody>
      </Collapse>
    </Card>
  );

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>Seleção Progressiva de Regras</Heading>
          <Text color="gray.600">
            Selecione as opções em sequência. Cada seleção revela as próximas opções disponíveis.
          </Text>
        </Box>

        <Divider />

        {/* 1. Nível de Ensino */}
        {renderSecao(
          "1. Nível de Ensino",
          mostrarSecoes.nivelEnsino,
          () => setMostrarSecoes(prev => ({ ...prev, nivelEnsino: !prev.nivelEnsino })),
          renderCheckboxGroup(
            "Selecione os níveis de ensino:",
            opcoes.niveisEnsino,
            selecoes.nivelEnsino,
            handleNivelEnsinoChange
          )
        )}

        {/* 2. Tipos de Turma */}
        {renderSecao(
          "2. Tipos de Turma",
          mostrarSecoes.tiposTurma,
          () => setMostrarSecoes(prev => ({ ...prev, tiposTurma: !prev.tiposTurma })),
          <VStack align="stretch" spacing={4}>
            {selecoes.nivelEnsino.map(nivel => (
              <Box key={nivel} p={4} bg="gray.50" borderRadius="md">
                <Text fontWeight="bold" mb={3} color="blue.600">
                  Para {nivel}:
                </Text>
                {renderCheckboxGroup(
                  "Selecione os tipos de turma:",
                  (opcoes.tiposTurma as any)[nivel] || [],
                  (selecoes.tiposTurma as any)[nivel] || [],
                  (tipoTurma, checked) => handleTipoTurmaChange(nivel, tipoTurma, checked)
                )}
              </Box>
            ))}
          </VStack>
        )}

        {/* 3. Tipos de Professor por Turma */}
        {renderSecao(
          "3. Tipos de Professor por Turma",
          mostrarSecoes.tiposProfessor,
          () => setMostrarSecoes(prev => ({ ...prev, tiposProfessor: !prev.tiposProfessor })),
          <VStack align="stretch" spacing={4}>
            {selecoes.nivelEnsino.map(nivel => (
              (selecoes.tiposTurma as any)[nivel]?.map((tipoTurma: string) => (
                <Box key={`${nivel}-${tipoTurma}`} p={4} bg="blue.50" borderRadius="md">
                  <Text fontWeight="bold" mb={3} color="blue.700">
                    {nivel} + {(opcoes.tiposTurma as any)[nivel]?.find((t: any) => t.value === tipoTurma)?.label}:
                  </Text>
                  {renderCheckboxGroup(
                    "Selecione os tipos de professor:",
                    opcoes.tiposProfessor,
                    (selecoes.tiposProfessorPorTurma as any)[nivel]?.[tipoTurma] || [],
                    (tipoProfessor, checked) => handleTipoProfessorChange(nivel, tipoTurma, tipoProfessor, checked)
                  )}
                </Box>
              ))
            ))}
          </VStack>
        )}

        {/* 4. Tipo Avaliado */}
        {renderSecao(
          "4. Tipo Avaliado",
          mostrarSecoes.tipoAvaliado,
          () => setMostrarSecoes(prev => ({ ...prev, tipoAvaliado: !prev.tipoAvaliado })),
          renderCheckboxGroup(
            "Selecione os tipos avaliados:",
            opcoes.tiposAvaliado,
            selecoes.tipoAvaliado,
            handleTipoAvaliadoChange
          )
        )}

        {/* 5. Tipos de Professor por Avaliado */}
        {renderSecao(
          "5. Tipos de Professor por Avaliado",
          mostrarSecoes.tiposProfessorAvaliado,
          () => setMostrarSecoes(prev => ({ ...prev, tiposProfessorAvaliado: !prev.tiposProfessorAvaliado })),
          <VStack align="stretch" spacing={4}>
            {selecoes.tipoAvaliado.map(tipoAvaliado => (
              <Box key={tipoAvaliado} p={4} bg="green.50" borderRadius="md">
                <Text fontWeight="bold" mb={3} color="green.700">
                  Para {opcoes.tiposAvaliado.find(t => t.value === tipoAvaliado)?.label}:
                </Text>
                {renderCheckboxGroup(
                  "Selecione os tipos de professor:",
                  opcoes.tiposProfessor,
                  selecoes.tiposProfessorPorAvaliado[tipoAvaliado] || [],
                  (tipoProfessor, checked) => handleTipoProfessorAvaliadoChange(tipoAvaliado, tipoProfessor, checked)
                )}
              </Box>
            ))}
          </VStack>
        )}

        {/* Resumo das Seleções */}
        <Card variant="filled" bg="purple.50">
          <CardHeader>
            <Heading size="md" color="purple.700">Resumo das Seleções</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={2}>
              <Text><strong>Níveis de Ensino:</strong> {selecoes.nivelEnsino.join(', ') || 'Nenhum'}</Text>
              <Text><strong>Tipos de Turma:</strong> {Object.entries(selecoes.tiposTurma).map(([nivel, tipos]) => 
                `${nivel}: ${tipos.join(', ')}`
              ).join(' | ') || 'Nenhum'}</Text>
              <Text><strong>Tipos de Professor:</strong> {Object.entries(selecoes.tiposProfessorPorTurma).map(([nivel, tipos]) => 
                `${nivel}: ${Object.entries(tipos).map(([turma, profs]) => 
                  `${turma}(${profs.join(', ')})`
                ).join(', ')}`
              ).join(' | ') || 'Nenhum'}</Text>
              <Text><strong>Tipos Avaliados:</strong> {selecoes.tipoAvaliado.join(', ') || 'Nenhum'}</Text>
            </VStack>
          </CardBody>
        </Card>

        {isLoading && (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <Text fontSize="sm">Salvando configurações...</Text>
          </Alert>
        )}
      </VStack>
    </Box>
  );
};

export default SelecaoProgressiva;
