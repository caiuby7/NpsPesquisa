import { useNavigate } from "react-router-dom";
import { MdFormatAlignJustify, MdPeople, MdFormatShapes } from "react-icons/md";
import { TbPencilQuestion } from "react-icons/tb";
import { Box, Button, Heading, HStack, Text, VStack, SimpleGrid } from "@chakra-ui/react";
import { useColorModeValue } from "../../components/ui/color-mode";
import { MainLayout } from "../../components/layout/main-layout.component";
import Cookies from "js-cookie";

type CardButtonProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  colorScheme?: string;
};

export function CardButton({
  icon,
  title,
  description,
  onClick,
  colorScheme = "blue"
}: CardButtonProps) {
  const bg = useColorModeValue("white", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.600");

  return (
    <Box
      as="button"
      onClick={onClick}
      w="full"
      cursor="pointer"
      textAlign="left"
      bg={bg}
      borderWidth="1px"
      borderRadius="xl"
      p={6}
      _hover={{ bg: hoverBg }}
      boxShadow="sm"
      flexDirection="column"
      display="flex"
      gap={4}
      alignItems="start"
      transition="all 0.2s"
      _active={{ transform: 'scale(0.98)' }}
    >
      <Box 
        p={3} 
        borderRadius="lg" 
        bg={`${colorScheme}.100`} 
        color={`${colorScheme}.600`}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {icon}
      </Box>

      <Text fontWeight="semibold" fontSize="lg">
        {title}
      </Text>
      <Text fontSize="sm" color="gray.500">
        {description}
      </Text>
    </Box>
  );
}

export default function HomePage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    Cookies.remove("token", { path: "/" });
    navigate("/login");
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <MainLayout>
      <Box maxW="6xl" mx="auto" p={6}>
        <Box textAlign="center" mb={8}>
          <Heading size="xl" mb={4}>Painel Administrativo</Heading>
          <Text fontSize="lg" color="gray.600">
            Sistema Unificado de Avaliação Institucional e Gestão Acadêmica
          </Text>
        </Box>

        {/* Avaliação Institucional */}
        <Box mb={8}>
          <Heading size="lg" mb={4} color="purple.600">🎓 Avaliação Institucional</Heading>
          <Text color="gray.600" mb={4}>
            Gerencie avaliações acadêmicas e institucionais
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            <CardButton
              icon={<TbPencilQuestion size={24} />}
              title="Criar Avaliação"
              description="Crie uma nova avaliação institucional"
              onClick={() => handleNavigate("/avaliacoes/criar")}
              colorScheme="purple"
            />
            <CardButton
              icon={<MdFormatAlignJustify size={24} />}
              title="Listar Avaliações"
              description="Visualize todas as avaliações criadas"
              onClick={() => handleNavigate("/avaliacoes")}
              colorScheme="purple"
            />
          </SimpleGrid>
        </Box>

        {/* Gestão Acadêmica */}
        <Box mb={8}>
          <Heading size="lg" mb={4} color="blue.600">🏛️ Gestão Acadêmica</Heading>
          <Text color="gray.600" mb={4}>
            Gerencie entidades acadêmicas e estrutura institucional
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            <CardButton
              icon={<MdPeople size={24} />}
              title="Instituições"
              description="Gerencie instituições de ensino"
              onClick={() => handleNavigate("/instituicoes")}
              colorScheme="blue"
            />
            <CardButton
              icon={<MdFormatAlignJustify size={24} />}
              title="Períodos Letivos"
              description="Gerencie períodos acadêmicos"
              onClick={() => handleNavigate("/periodos-letivos")}
              colorScheme="blue"
            />
            <CardButton
              icon={<MdFormatAlignJustify size={24} />}
              title="Cursos"
              description="Gerencie cursos e graduações"
              onClick={() => handleNavigate("/cursos")}
              colorScheme="blue"
            />
            <CardButton
              icon={<MdFormatAlignJustify size={24} />}
              title="Disciplinas"
              description="Gerencie disciplinas acadêmicas"
              onClick={() => handleNavigate("/disciplinas")}
              colorScheme="blue"
            />
            <CardButton
              icon={<MdPeople size={24} />}
              title="Turmas"
              description="Gerencie turmas de alunos"
              onClick={() => handleNavigate("/turmas")}
              colorScheme="blue"
            />
            <CardButton
              icon={<MdFormatAlignJustify size={24} />}
              title="Turma-Disciplina"
              description="Gerencie vínculos turma-disciplina"
              onClick={() => handleNavigate("/turma-disciplina")}
              colorScheme="blue"
            />
            <CardButton
              icon={<MdPeople size={24} />}
              title="Professores"
              description="Gerencie corpo docente"
              onClick={() => handleNavigate("/professores")}
              colorScheme="blue"
            />
            <CardButton
              icon={<MdPeople size={24} />}
              title="Alunos"
              description="Gerencie estudantes"
              onClick={() => handleNavigate("/alunos")}
              colorScheme="blue"
            />
          </SimpleGrid>
        </Box>

        {/* Gestão de Questões */}
        <Box mb={8}>
          <Heading size="lg" mb={4} color="teal.600">❓ Gestão de Questões</Heading>
          <Text color="gray.600" mb={4}>
            Gerencie questões do sistema
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            <CardButton
              icon={<TbPencilQuestion size={24} />}
              title="Criar Questão"
              description="Crie uma nova questão para o sistema"
              onClick={() => handleNavigate("/create-question")}
              colorScheme="teal"
            />
            <CardButton
              icon={<MdFormatAlignJustify size={24} />}
              title="Listar Questões"
              description="Visualize todas as questões criadas"
              onClick={() => handleNavigate("/questions")}
              colorScheme="teal"
            />
          </SimpleGrid>
        </Box>

        {/* Relatórios */}
        <Box mb={8}>
          <Heading size="lg" mb={4} color="orange.600">📊 Relatórios</Heading>
          <Text color="gray.600" mb={4}>
            Visualize métricas, relatórios e dashboards do sistema
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            <CardButton
              icon={<MdFormatAlignJustify size={24} />}
              title="Dashboard"
              description="Visualize métricas e relatórios gerais"
              onClick={() => handleNavigate("/dashboard")}
              colorScheme="orange"
            />
            <CardButton
              icon={<MdPeople size={24} />}
              title="Acompanhamento"
              description="Relatórios de acompanhamento de respondentes"
              onClick={() => handleNavigate("/relatorios/acompanhamento")}
              colorScheme="blue"
            />
          </SimpleGrid>
        </Box>
      </Box>
    </MainLayout>
  );
} 
