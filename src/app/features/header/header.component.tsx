import { useColorModeValue } from "@/components/ui/color-mode";
import {
    Box,
    Flex,
    HStack,
    Avatar,
    Text,
    Button,
} from "@chakra-ui/react";
import { useRouter } from "next/router";

const pages = [
        { label: "Home", path: "/home" },
    { label: "Criar Questão", path: "/create-question" },
    { label: "Criar Formulário", path: "/create-form" },
    { label: "Formulários", path: "/forms" },
    { label: "Questões", path: "/questions" },
];

export function AppHeader() {
    const bg = useColorModeValue("gray.800", "gray.900");
    const color = useColorModeValue("white", "white");
    const router = useRouter();


    return (
        <Box bg={bg} color={color} px={6} py={3} boxShadow="sm">
            <Flex align="center" justify="space-between">
                {/* Logo */}
                <Text fontSize="lg" fontWeight="bold">
                    🐵 Logo
                </Text>

                {/* Navigation Tabs */}
                <HStack>
                    {pages.map((page) => {
                        const isActive = router.pathname === page.path;
                        return (
                            <Button
                                key={page.path}
                                variant="ghost"
                                color={isActive ? "white" : "gray.400"}
                                fontWeight={isActive ? "bold" : "normal"}
                                borderBottom={isActive ? "2px solid white" : "none"}
                                borderRadius="0"
                                _hover={{ color: "white", bg: "transparent" }}
                                onClick={() => router.push(page.path)}
                            >
                                {page.label}
                            </Button>
                        );
                    })}
                </HStack>
                {/* Avatar */}
                <HStack>
                    <Avatar.Root>
                        <Avatar.Fallback name="Segun Adebayo" />
                        <Avatar.Image src="https://bit.ly/sage-adebayo" />
                    </Avatar.Root>
                </HStack>
            </Flex>
        </Box>
    );
}
