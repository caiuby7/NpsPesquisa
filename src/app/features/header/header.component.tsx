import {
    Box,
    Flex,
    HStack,
    Avatar,
    Button,
    Image,
    useColorMode
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { MdHome } from "react-icons/md";

const pages = [
    { label: "Home", path: "/home" },
    { label: "Criar Questão", path: "/create-question" },
    { label: "Criar Formulário", path: "/create-form" },
    { label: "Formulários", path: "/formularios" },
    { label: "Questões", path: "/questions" },
    { label: "Participantes", path: "/participantes" },
    { label: "Cursos", path: "/cursos" },
    { label: "Instituições", path: "/instituicoes" },
    { label: "Períodos Letivos", path: "/periodos-letivos" },
    { label: "Disciplinas", path: "/disciplinas" },
    { label: "Turmas", path: "/turmas" },
    { label: "Turma-Disciplina", path: "/turma-disciplina" },
    { label: "Professores", path: "/professores" },
];

export function AppHeader() {
    const { colorMode } = useColorMode();
    const navigate = useNavigate();

    return (
        <Box bg={colorMode === "light" ? "brand.500" : "brand.600"} color="white" px={6} py={3} boxShadow="sm">
            <Flex align="center" justify="space-between">
                {/* Logo */}
                <Image 
                    src="/logo.png" 
                    alt="Logo" 
                    style={{ height: 40, marginRight: 8, cursor: 'pointer' }} 
                    onClick={() => navigate("/home")}
                />

                {/* Navigation Tabs */}
                <HStack>
                    {pages.map((page) => {
                        const isActive = window.location.pathname === page.path;
                        return (
                            <Button
                                key={page.path}
                                variant="ghost"
                                color={isActive ? "white" : "#9d2235"}
                                bg={isActive ? "#9d2235" : "transparent"}
                                fontWeight={isActive ? "bold" : "normal"}
                                borderRadius="0"
                                _hover={{ color: "white", bg: "#9d2235" }}
                                onClick={() => navigate(page.path)}
                                leftIcon={page.label === "Home" ? <MdHome size={18} /> : undefined}
                            >
                                {page.label}
                            </Button>
                        );
                    })}
                </HStack>
                {/* Avatar */}
                <Avatar name="User" />
            </Flex>
        </Box>
    );
}
