import { useNavigate } from "react-router-dom";
import { MdFormatAlignJustify } from "react-icons/md";
import { TbPencilQuestion } from "react-icons/tb";
import { MdFormatShapes } from "react-icons/md";
import { MdPeople } from "react-icons/md";
import { Box, Button, Heading, HStack, Text } from "@chakra-ui/react";
import { useColorModeValue } from "../../components/ui/color-mode";
import { AppHeader } from "../../components/header/header.component";
import Cookies from "js-cookie";

type CardButtonProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
};

export function CardButton({
  icon,
  title,
  description,
  onClick,
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
      p={4}
      _hover={{ bg: hoverBg }}
      boxShadow="sm"
      flexDirection="column"
      display="flex"
      gap={4}
      alignItems="start"
    >
      {icon}

      <Text fontWeight="semibold" fontSize="sm">
        {title}
      </Text>
      <Text fontSize="xs" color="gray.500">
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
    <>
      <AppHeader />
      <Box maxW="xl" mx="auto" p={8} borderRadius="lg" textAlign="center">
        <Heading mb={4}>Painel Administrativo</Heading>

        <HStack mb={4}>
          <CardButton
            icon={<TbPencilQuestion />}
            title="Criar Questão"
            description="Crie uma nova questão"
            onClick={() => handleNavigate("/create-question")}
          />
          <CardButton
            icon={<MdFormatShapes />}
            title="Criar Formulário"
            description="Criar um novo formulário"
            onClick={() => handleNavigate("/create-form")}
          />
        </HStack>
        <HStack mb={4}>
          <CardButton
            icon={<MdFormatAlignJustify />}
            title="Formulários"
            description="Visualize todos os formulários"
            onClick={() => handleNavigate("/formularios")}
          />
          <CardButton
            icon={<MdFormatAlignJustify />}
            title="Questões"
            description="Visualize todas as questões"
            onClick={() => handleNavigate("/questions")}
          />
        </HStack>
        <HStack>
          <CardButton
            icon={<MdPeople />}
            title="Participantes"
            description="Gerencie os participantes"
            onClick={() => handleNavigate("/participantes")}
          />
          <CardButton
            icon={<MdFormatAlignJustify />}
            title="Cursos"
            description="Gerencie os cursos"
            onClick={() => handleNavigate("/cursos")}
          />
        </HStack>
        <Button
          size="sm"
          variant="ghost"
          colorScheme="red"
          mt={6}
          onClick={handleLogout}
        >
          Sair
        </Button>
      </Box>
    </>
  );
} 