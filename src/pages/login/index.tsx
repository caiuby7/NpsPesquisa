// pages/login.tsx
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/router'
import {
  Box, Button, Input, Heading, Text,
  Stack
} from '@chakra-ui/react'

type LoginData = {
  email: string
  password: string
}

export default function LoginPage() {
  const { register, handleSubmit } = useForm<LoginData>()
  const router = useRouter()

  const onSubmit = async (data: LoginData) => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      router.push('/dashboard')
    } 
  }

  return (
    <Box maxW="md" mx="auto" mt={20} p={8} borderWidth={1} borderRadius="lg">
      <Heading mb={6}>Admin</Heading>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack mb={4}>
          <Text>Email</Text>
          <Input type="email" {...register('email')} required />
        </Stack>
        <Stack mb={6}>
          <Text>Senha</Text>
          <Input type="password" {...register('password')} required />
        </Stack>
        <Button colorScheme="purple" type="submit" width="full">
          Entrar
        </Button>
      </form>
    </Box>
  )
}
