import { useColorModeValue } from "@/components/ui/color-mode";
import {
    Box,
    Flex,
    HStack,
    Avatar,
    Button,
    Image
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import NextLink from 'next/link';

const pages = [
    { label: "Home", path: "/home" },
    { label: "Criar Questão", path: "/create-question" },
    { label: "Criar Formulário", path: "/create-form" },
    { label: "Formulários", path: "/formularios" },
    { label: "Questões", path: "/questions" },
    { label: "Participantes", path: "/participantes" },
    { label: "Cursos", path: "/cursos" },
];

export function AppHeader() {
    const bg = useColorModeValue("brand.500", "brand.600");
    const color = useColorModeValue("white", "white");
    const router = useRouter();

    return (
        <Box bg={bg} color={color} px={6} py={3} boxShadow="sm">
            <Flex align="center" justify="space-between">
                {/* Logo */}
                <NextLink href="/home">
                    <Image src="/logo.png" alt="Logo" style={{ height: 40, marginRight: 8, cursor: 'pointer' }} />
                </NextLink>

                {/* Navigation Tabs */}
                <HStack>
                    {pages.map((page) => {
                        const isActive = router.pathname === page.path;
                        return (
                            <Button
                                key={page.path}
                                variant="ghost"
                                color={isActive ? "white" : "#9d2235"}
                                bg={isActive ? "#9d2235" : "transparent"}
                                fontWeight={isActive ? "bold" : "normal"}
                                borderRadius="0"
                                _hover={{ color: "white", bg: "#9d2235" }}
                                onClick={() => router.push(page.path)}
                            >
                                {page.label}
                            </Button>
                        );
                    })}
                </HStack>
                {/* Avatar */}
                <Avatar.Root>
                    <Avatar.Fallback name="User" />
                </Avatar.Root>
            </Flex>
        </Box>
    );
}
