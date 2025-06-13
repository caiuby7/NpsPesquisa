import { useEffect, useState } from "react";
import { Box, Button, Heading, Input, Stack, Flex, Text, HStack } from "@chakra-ui/react";
import { AppHeader } from "@/app/features/header/header.component";
import { api } from "@/app/services/api";

interface Curso {
  id: number;
  nome: string;
}

export default function CursosPage() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [novoCurso, setNovoCurso] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editandoNome, setEditandoNome] = useState("");

  useEffect(() => {
    fetchCursos();
  }, []);

  async function fetchCursos() {
    try {
      const res = await api.get("/Curso");
      setCursos(res.data);
    } catch (e) {
      alert("Erro ao buscar cursos");
    }
  }

  async function handleCreate() {
    if (!novoCurso) return;
    try {
      await api.post("/Curso", { nome: novoCurso });
      setNovoCurso("");
      fetchCursos();
    } catch (e) {
      alert("Erro ao criar curso");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja remover este curso?")) return;
    try {
      await api.delete(`/Curso/${id}`);
      fetchCursos();
    } catch (e) {
      alert("Erro ao remover curso");
    }
  }

  async function handleEdit(id: number, nome: string) {
    setEditandoId(id);
    setEditandoNome(nome);
  }

  async function handleUpdate() {
    if (editandoId === null || !editandoNome) return;
    try {
      await api.put(`/Curso/${editandoId}`, { nome: editandoNome });
      setEditandoId(null);
      setEditandoNome("");
      fetchCursos();
    } catch (e) {
      alert("Erro ao atualizar curso");
    }
  }

  return (
    <Box>
      <AppHeader />
      <Box p={8} maxW="600px" m="auto">
        <Heading mb={8}>Cadastro de Cursos</Heading>
        <Stack gap={4} mb={8}>
          <Input
            placeholder="Nome do novo curso"
            value={novoCurso}
            onChange={e => setNovoCurso(e.target.value)}
          />
          <Button colorScheme="teal" onClick={handleCreate}>Cadastrar Curso</Button>
        </Stack>
        <Stack gap={4}>
          {cursos.length === 0 && (
            <Text color="gray.500">Nenhum curso cadastrado.</Text>
          )}
          {cursos.map(curso => (
            <Flex
              key={curso.id}
              p={4}
              borderWidth={1}
              borderRadius="md"
              align="center"
              justify="space-between"
              bg="white"
              boxShadow="sm"
            >
              {editandoId === curso.id ? (
                <HStack gap={2}>
                  <Input
                    value={editandoNome}
                    onChange={e => setEditandoNome(e.target.value)}
                    size="sm"
                  />
                  <Button size="sm" colorScheme="teal" onClick={handleUpdate}>Salvar</Button>
                  <Button size="sm" onClick={() => setEditandoId(null)}>Cancelar</Button>
                </HStack>
              ) : (
                <>
                  <Text fontWeight="bold">{curso.nome}</Text>
                  <HStack gap={2}>
                    <Button size="sm" colorScheme="blue" variant="outline" onClick={() => handleEdit(curso.id, curso.nome)}>Editar</Button>
                    <Button size="sm" colorScheme="red" variant="outline" onClick={() => handleDelete(curso.id)}>Remover</Button>
                  </HStack>
                </>
              )}
            </Flex>
          ))}
        </Stack>
      </Box>
    </Box>
  );
} 