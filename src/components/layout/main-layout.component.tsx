import React, { useState } from 'react';
import { 
  Box, 
  Flex, 
  VStack, 
  HStack, 
  Text, 
  Icon, 
  Image,
  useColorModeValue,
  Collapse,
  IconButton,
  useDisclosure,
  Divider,
  Badge
} from '@chakra-ui/react';
import { 
  FiHome, 
  FiBarChart2, 
  FiFileText, 
  FiUsers, 
  FiBookOpen, 
  FiCalendar,
  FiTarget,
  FiSettings,
  FiChevronDown,
  FiChevronRight,
  FiMenu,
  FiX
} from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface NavItemProps {
  icon: React.ElementType;
  children: React.ReactNode;
  href?: string;
  isActive?: boolean;
  onClick?: () => void;
  badge?: string;
  badgeColor?: string;
}

const NavItem = ({ icon, children, href, isActive, onClick, badge, badgeColor = "blue" }: NavItemProps) => {
  const bg = useColorModeValue(isActive ? 'blue.50' : 'transparent', isActive ? 'blue.900' : 'transparent');
  const color = useColorModeValue(isActive ? 'blue.600' : 'gray.600', isActive ? 'blue.200' : 'gray.300');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  return (
    <Box
      as="button"
      w="full"
      textAlign="left"
      bg={bg}
      color={color}
      px={4}
      py={3}
      borderRadius="md"
      _hover={{ bg: hoverBg }}
      transition="all 0.2s"
      onClick={onClick}
      position="relative"
    >
      <HStack spacing={3} justify="space-between">
        <HStack spacing={3}>
          <Icon as={icon} boxSize={5} />
          <Text fontSize="sm" fontWeight={isActive ? 'semibold' : 'medium'}>
            {children}
          </Text>
        </HStack>
        {badge && (
          <Badge size="sm" colorScheme={badgeColor} variant="subtle">
            {badge}
          </Badge>
        )}
      </HStack>
    </Box>
  );
};

interface NavSectionProps {
  title: string;
  children: React.ReactNode;
  isExpanded?: boolean;
  onToggle?: () => void;
}

const NavSection = ({ title, children, isExpanded = true, onToggle }: NavSectionProps) => {
  const [isOpen, setIsOpen] = useState(isExpanded);
  
  const handleToggle = () => {
    setIsOpen(!isOpen);
    onToggle?.();
  };

  return (
    <Box>
      <Box
        as="button"
        w="full"
        textAlign="left"
        px={4}
        py={2}
        fontWeight="semibold"
        fontSize="xs"
        color="gray.500"
        textTransform="uppercase"
        letterSpacing="wide"
        onClick={handleToggle}
        _hover={{ color: 'gray.700' }}
        transition="color 0.2s"
      >
        <HStack spacing={2} justify="space-between">
          <Text>{title}</Text>
          <Icon 
            as={isOpen ? FiChevronDown : FiChevronRight} 
            boxSize={4} 
            transition="transform 0.2s"
          />
        </HStack>
      </Box>
      <Collapse in={isOpen} animateOpacity>
        <VStack spacing={1} align="stretch" mt={2}>
          {children}
        </VStack>
      </Collapse>
    </Box>
  );
};

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const { isOpen, onToggle } = useDisclosure();
  
  const sidebarBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const mainBg = useColorModeValue('gray.50', 'gray.900');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const renderMenuByProfile = () => {
    const perfil = user?.perfil?.toLowerCase();
    
    switch (perfil) {
      case 'aluno':
        return (
          <VStack spacing={6} align="stretch">
            {/* Dashboard */}
            <NavSection title="Dashboard" isExpanded={true}>
              <NavItem 
                icon={FiHome} 
                href="/aluno/dashboard"
                isActive={isActiveRoute('/aluno/dashboard')}
                onClick={() => navigate('/aluno/dashboard')}
                badge="Aluno"
                badgeColor="blue"
              >
                Meu Dashboard
              </NavItem>
            </NavSection>

            {/* Questionários */}
            <NavSection title="Questionários" isExpanded={true}>
              <NavItem 
                icon={FiFileText} 
                href="/aluno/questionarios"
                isActive={isActiveRoute('/aluno/questionarios')}
                onClick={() => navigate('/aluno/questionarios')}
                badge="QR"
                badgeColor="green"
              >
                Questionários Disponíveis
              </NavItem>
              <NavItem 
                icon={FiBarChart2} 
                href="/aluno/historico"
                isActive={isActiveRoute('/aluno/historico')}
                onClick={() => navigate('/aluno/historico')}
                badge="H"
                badgeColor="purple"
              >
                Meu Histórico
              </NavItem>
            </NavSection>

            {/* Sistema */}
            <NavSection title="Sistema" isExpanded={false}>
              <NavItem 
                icon={FiBookOpen} 
                href="/faq-aluno"
                isActive={isActiveRoute('/faq-aluno')}
                onClick={() => navigate('/faq-aluno')}
                badge="Manual"
                badgeColor="blue"
              >
                Manual/FAQ
              </NavItem>
            </NavSection>
          </VStack>
        );

      case 'professor':
        return (
          <VStack spacing={6} align="stretch">
            {/* Dashboard */}
            <NavSection title="Dashboard" isExpanded={true}>
              <NavItem 
                icon={FiHome} 
                href="/professor/dashboard"
                isActive={isActiveRoute('/professor/dashboard')}
                onClick={() => navigate('/professor/dashboard')}
                badge="Professor"
                badgeColor="green"
              >
                Meu Dashboard
              </NavItem>
            </NavSection>

            {/* Questionários */}
            <NavSection title="Questionários" isExpanded={true}>
              <NavItem 
                icon={FiFileText} 
                href="/professor/questionarios"
                isActive={isActiveRoute('/professor/questionarios')}
                onClick={() => navigate('/professor/questionarios')}
                badge="QR"
                badgeColor="green"
              >
                Questionários para Responder
              </NavItem>
              <NavItem 
                icon={FiBarChart2} 
                href="/professor/historico"
                isActive={isActiveRoute('/professor/historico')}
                onClick={() => navigate('/professor/historico')}
                badge="H"
                badgeColor="purple"
              >
                Meu Histórico
              </NavItem>
            </NavSection>

            {/* Sistema */}
            <NavSection title="Sistema" isExpanded={false}>
              <NavItem 
                icon={FiBookOpen} 
                href="/faq-professor"
                isActive={isActiveRoute('/faq-professor')}
                onClick={() => navigate('/faq-professor')}
                badge="Manual"
                badgeColor="blue"
              >
                Manual/FAQ
              </NavItem>
            </NavSection>
          </VStack>
        );

      case 'cpa':
      case 'administrador':
        return (
          <VStack spacing={6} align="stretch">
            {/* Dashboard */}
            <NavSection title="Dashboard" isExpanded={true}>
              <NavItem 
                icon={FiHome} 
                href="/cpa/dashboard"
                isActive={isActiveRoute('/cpa/dashboard')}
                onClick={() => navigate('/cpa/dashboard')}
                badge={perfil === 'cpa' ? "CPA" : "ADM"}
                badgeColor="red"
              >
                Dashboard {perfil === 'cpa' ? 'CPA' : 'Administrador'}
              </NavItem>
            </NavSection>

            {/* Relatórios */}
            <NavSection title="Relatórios" isExpanded={true}>
              <NavItem 
                icon={FiBarChart2} 
                href="/dashboard"
                isActive={isActiveRoute('/dashboard')}
                onClick={() => navigate('/dashboard')}
                badge="RPT"
                badgeColor="orange"
              >
                Dashboard Geral
              </NavItem>
              <NavItem 
                icon={FiFileText} 
                href="/institutional-evaluation-example"
                isActive={isActiveRoute('/institutional-evaluation-example')}
                onClick={() => navigate('/institutional-evaluation-example')}
                badge="EX"
                badgeColor="green"
              >
                Exemplo Avaliação
              </NavItem>
            </NavSection>

            {/* Avaliação Institucional */}
            <NavSection title="Avaliação Institucional" isExpanded={true}>
              <NavItem 
                icon={FiTarget} 
                href="/avaliacoes/criar"
                isActive={isActiveRoute('/avaliacoes/criar')}
                onClick={() => navigate('/avaliacoes/criar')}
                badge="Novo"
                badgeColor="orange"
              >
                Criar Avaliação
              </NavItem>
              <NavItem 
                icon={FiFileText} 
                href="/avaliacoes"
                isActive={isActiveRoute('/avaliacoes')}
                onClick={() => navigate('/avaliacoes')}
                badge="AI"
                badgeColor="purple"
              >
                Listar Avaliações
              </NavItem>
              <NavItem 
                icon={FiUsers} 
                href="/avaliacao-institucional"
                isActive={isActiveRoute('/avaliacao-institucional')}
                onClick={() => navigate('/avaliacao-institucional')}
                badge="AI"
                badgeColor="purple"
              >
                Responder Avaliação
              </NavItem>
            </NavSection>

            {/* Gestão Acadêmica */}
            <NavSection title="Gestão Acadêmica" isExpanded={true}>
              <NavItem 
                icon={FiHome} 
                href="/instituicoes"
                isActive={isActiveRoute('/instituicoes')}
                onClick={() => navigate('/instituicoes')}
              >
                Instituições
              </NavItem>
              <NavItem 
                icon={FiCalendar} 
                href="/periodos-letivos"
                isActive={isActiveRoute('/periodos-letivos')}
                onClick={() => navigate('/periodos-letivos')}
              >
                Períodos Letivos
              </NavItem>
              <NavItem 
                icon={FiBookOpen} 
                href="/cursos"
                isActive={isActiveRoute('/cursos')}
                onClick={() => navigate('/cursos')}
              >
                Cursos
              </NavItem>
              <NavItem 
                icon={FiBookOpen} 
                href="/disciplinas"
                isActive={isActiveRoute('/disciplinas')}
                onClick={() => navigate('/disciplinas')}
              >
                Disciplinas
              </NavItem>
              <NavItem 
                icon={FiUsers} 
                href="/turmas"
                isActive={isActiveRoute('/turmas')}
                onClick={() => navigate('/turmas')}
              >
                Turmas
              </NavItem>
              <NavItem 
                icon={FiTarget} 
                href="/turma-disciplina"
                isActive={isActiveRoute('/turma-disciplina')}
                onClick={() => navigate('/turma-disciplina')}
              >
                Turma-Disciplina
              </NavItem>
              <NavItem 
                icon={FiUsers} 
                href="/professores"
                isActive={isActiveRoute('/professores')}
                onClick={() => navigate('/professores')}
              >
                Professores
              </NavItem>
              <NavItem 
                icon={FiUsers} 
                href="/alunos"
                isActive={isActiveRoute('/alunos')}
                onClick={() => navigate('/alunos')}
              >
                Alunos
              </NavItem>
            </NavSection>

            {/* Gestão de Questões */}
            <NavSection title="Gestão de Questões" isExpanded={true}>
              <NavItem 
                icon={FiTarget} 
                href="/create-question"
                isActive={isActiveRoute('/create-question')}
                onClick={() => navigate('/create-question')}
                badge="Novo"
                badgeColor="blue"
              >
                Criar Questão
              </NavItem>
              <NavItem 
                icon={FiBarChart2} 
                href="/questions"
                isActive={isActiveRoute('/questions')}
                onClick={() => navigate('/questions')}
                badge="GQ"
                badgeColor="teal"
              >
                Listar Questões
              </NavItem>
              <NavItem 
                icon={FiTarget} 
                href="/test-conditional-questions"
                isActive={isActiveRoute('/test-conditional-questions')}
                onClick={() => navigate('/test-conditional-questions')}
                badge="Teste"
                badgeColor="purple"
              >
                Testar Condicionais
              </NavItem>
            </NavSection>

            {/* Sistema */}
            <NavSection title="Sistema" isExpanded={false}>
              <NavItem 
                icon={FiBookOpen} 
                href="/faq"
                isActive={isActiveRoute('/faq')}
                onClick={() => navigate('/faq')}
                badge="Manual"
                badgeColor="blue"
              >
                Manual/FAQ
              </NavItem>
              <NavItem 
                icon={FiSettings} 
                href="/configuracoes"
                isActive={isActiveRoute('/configuracoes')}
                onClick={() => navigate('/configuracoes')}
              >
                Configurações
              </NavItem>
            </NavSection>
          </VStack>
        );

      default:
        // Menu padrão para usuários sem perfil definido
        return (
          <VStack spacing={6} align="stretch">
            {/* Relatórios */}
            <NavSection title="Relatórios" isExpanded={true}>
              <NavItem 
                icon={FiBarChart2} 
                href="/dashboard"
                isActive={isActiveRoute('/dashboard')}
                onClick={() => navigate('/dashboard')}
                badge="RPT"
                badgeColor="orange"
              >
                Dashboard
              </NavItem>
            </NavSection>

            {/* Sistema */}
            <NavSection title="Sistema" isExpanded={false}>
              <NavItem 
                icon={FiBookOpen} 
                href="/faq"
                isActive={isActiveRoute('/faq')}
                onClick={() => navigate('/faq')}
                badge="Manual"
                badgeColor="blue"
              >
                Manual/FAQ
              </NavItem>
            </NavSection>
          </VStack>
        );
    }
  };

  return (
    <Flex h="100vh" bg={mainBg}>
      {/* Sidebar */}
      <Box
        w={{ base: isOpen ? '280px' : '80px', md: '280px' }}
        bg={sidebarBg}
        borderRight="1px"
        borderColor={borderColor}
        transition="width 0.3s"
        overflow="hidden"
        position="relative"
      >
        {/* Logo e Header da Sidebar */}
        <Box p={4} borderBottom="1px" borderColor={borderColor}>
          <HStack justify="space-between" position="relative">
            <HStack spacing={3} flex="1" justify="center">
              <Image 
                src="/logo.png" 
                alt="Logo PUC Católica" 
                w="12" 
                h="12" 
                objectFit="contain"
                flexShrink={0}
              />
              <VStack spacing={0} align="start" display={{ base: isOpen ? 'flex' : 'none', md: 'flex' }}>
                <Text 
                  fontSize="sm" 
                  fontWeight="bold" 
                  color="red.600"
                  lineHeight="tight"
                >
                  Católica de Santa Catarina
                </Text>
                <Text 
                  fontSize="xs" 
                  color="red.600"
                  lineHeight="tight"
                >
                  Centro Universitário
                </Text>
              </VStack>
            </HStack>
            <IconButton
              aria-label="Toggle sidebar"
              icon={isOpen ? <FiX /> : <FiMenu />}
              size="sm"
              variant="ghost"
              onClick={onToggle}
              display={{ base: 'flex', md: 'none' }}
              position="absolute"
              right={0}
            />
          </HStack>
        </Box>

        {/* Navegação */}
        <Box p={4} overflowY="auto" h="calc(100vh - 80px)">
          {renderMenuByProfile()}
        </Box>

        {/* Footer da Sidebar */}
        <Box 
          p={4} 
          borderTop="1px" 
          borderColor={borderColor}
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          bg={sidebarBg}
        >
          <NavItem 
            icon={FiX} 
            onClick={handleLogout}
            badge="Sair"
            badgeColor="red"
          >
            Logout
          </NavItem>
        </Box>
      </Box>

      {/* Conteúdo Principal */}
      <Box flex="1" overflow="auto">
        <Box p={6}>
          {children}
        </Box>
      </Box>
    </Flex>
  );
};

export default MainLayout;
