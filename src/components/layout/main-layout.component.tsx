import React, { useState } from 'react';
import { 
  Box, 
  Flex, 
  VStack, 
  HStack, 
  Text, 
  Icon, 
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
  const { logout } = useAuth();
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
          <HStack spacing={3} justify="space-between">
            <HStack spacing={3}>
              <Box 
                w="8" 
                h="8" 
                bg="blue.500" 
                borderRadius="md" 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
              >
                <Icon as={FiTarget} color="white" boxSize={5} />
              </Box>
              <Text 
                fontSize="lg" 
                fontWeight="bold" 
                color="blue.600"
                display={{ base: isOpen ? 'block' : 'none', md: 'block' }}
              >
                Sistema Unificado
              </Text>
            </HStack>
            <IconButton
              aria-label="Toggle sidebar"
              icon={isOpen ? <FiX /> : <FiMenu />}
              size="sm"
              variant="ghost"
              onClick={onToggle}
              display={{ base: 'flex', md: 'none' }}
            />
          </HStack>
        </Box>

        {/* Navegação */}
        <Box p={4} overflowY="auto" h="calc(100vh - 80px)">
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

            {/* Configurações */}
            <NavSection title="Sistema" isExpanded={false}>
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
