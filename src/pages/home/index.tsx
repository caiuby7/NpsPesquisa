import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react'
import { useRouter } from 'next/router'

export default function HomePage() {
  const router = useRouter()

  const handleLogout = () => {
    document.cookie = 'token=; Max-Age=0; path=/'
    router.push('/login')
  }

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  return (
    <Box maxW="lg" mx="auto" mt={20} p={8} borderWidth={1} borderRadius="lg" textAlign="center">
      <Heading mb={4}>Painel Administrativo</Heading>
      <Text mb={6}>Escolha uma ação abaixo:</Text>

      <VStack spacing={4}>
        <Button
          size="lg"
          colorScheme="teal"
          width="100%"
          onClick={() => handleNavigate('/create-question')}
        >
          Criar Questão
        </Button>
        <Button
          size="lg"
          colorScheme="purple"
          width="100%"
          onClick={() => handleNavigate('/create-form')}
        >
          Criar Formulário
        </Button>
        <Button
          size="lg"
          colorScheme="blue"
          width="100%"
          onClick={() => handleNavigate('/formularios')}
        >
          Ver Formulários
        </Button>
        <Button
          size="sm"
          variant="ghost"
          colorScheme="red"
          mt={6}
          onClick={handleLogout}
        >
          Sair
        </Button>
      </VStack>
    </Box>
  )
}
