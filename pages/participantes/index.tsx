import { useRouter } from "next/router";
import {
  Box,
  Button,
  Heading,
  Text,
  Stack,
  Flex,
  Input,
  HStack,
} from "@chakra-ui/react";
import { AppHeader } from "../src/app/features/header/header.component";
import { useEffect, useState } from "react";
import { MdDelete, MdEdit, MdPersonAdd } from "react-icons/md";
import { api } from "../src/app/services/api";

interface Participante {
  id: number;
  nome: string;
  email: string;
  matricula: string;
  status: "Ativo" | "Inativo";
}

export default function ParticipantesPage() {
  const router = useRouter();
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [novoParticipante, setNovoParticipante] = useState({
    nome: "",
    filial: "",
    nivelEnsino: "",
    periodoLetivo: "",
    matricula: "",
    nomeCurso: "",
    turno: "",
    emailInstitucional: "",
    emailPessoal: "",
    fone: "",
    statusNoPeriodoLetivo: "",
    aceitaContato: false,
  });

  useEffect(() => {
    fetchParticipantes();
  }, []);

  async function fetchParticipantes() {
    try {
      const res = await api.get("/Aluno");
      setParticipantes(
        res.data.map((item: any) => ({
          id: item.id,
          nome: item.nome,
          email: item.emailInstitucional || item.emailPessoal,
          matricula: item.matricula,
          status: item.statusNoPeriodoLetivo === "Ativo" ? "Ativo" : "Inativo"
        }))
      );
    } catch (e) {
      alert("Erro ao buscar participantes");
    }
  }

  const handleCreate = async () => {
    if (!novoParticipante.nome || !novoParticipante.matricula) {
      alert("Preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      await api.post("/Aluno", novoParticipante);
      alert("Participante criado com sucesso!");
      setShowModal(false);
      setNovoParticipante({
        nome: "",
        filial: "",
        nivelEnsino: "",
        periodoLetivo: "",
        matricula: "",
        nomeCurso: "",
        turno: "",
        emailInstitucional: "",
        emailPessoal: "",
        fone: "",
        statusNoPeriodoLetivo: "",
        aceitaContato: false
      });
      fetchParticipantes();
    } catch (e) {
      alert("Erro ao criar participante");
    }
    setLoading(false);
  };

  const handleRemove = async (id: number) => {
    if (!confirm("Tem certeza que deseja remover este participante?")) return;

    try {
      await api.delete(`/Aluno/${id}`);
      alert("Participante removido com sucesso!");
      fetchParticipantes();
    } catch (e) {
      alert("Erro ao remover participante");
    }
  };

  return (
    <Box>
      <AppHeader />
      <Box p={8} maxW="1200px" m="auto">
        <HStack justify="space-between" mb={8}>
          <Heading>Participantes</Heading>
          <Button
            colorScheme="teal"
            onClick={() => setShowModal(true)}
          >
            <Box as={MdPersonAdd} mr={2} display="inline" /> Novo Participante
          </Button>
        </HStack>

        {/* Lista de participantes */}
        <Stack gap={4}>
              {participantes.length === 0 && (
            <Text textAlign="center" color="gray.500">
                    Nenhum participante encontrado.
            </Text>
              )}
              {participantes.map((p) => (
            <Flex
              key={p.id}
              p={4}
              borderWidth={1}
              borderRadius="md"
              align="center"
              justify="space-between"
              bg="white"
              boxShadow="sm"
            >
              <Box>
                <Text fontWeight="bold">{p.nome}</Text>
                <Text fontSize="sm" color="gray.600">Matrícula: {p.matricula}</Text>
                <Text fontSize="sm" color={p.status === 'Ativo' ? "green.600" : "gray.500"}>
                      {p.status}
                </Text>
              </Box>
              <HStack>
                <Button
                  size="sm"
                        colorScheme="blue"
                  variant="outline"
                        onClick={() => router.push(`/participantes/${p.id}`)}
                >
                  <Box as={MdEdit} mr={2} display="inline" /> Editar
                </Button>
                <Button
                  size="sm"
                        colorScheme="red"
                  variant="outline"
                        onClick={() => handleRemove(p.id)}
                >
                  <Box as={MdDelete} mr={2} display="inline" /> Remover
                </Button>
                    </HStack>
            </Flex>
          ))}
        </Stack>

        {/* Modal de criação customizado */}
        {showModal && (
          <Box
            pos="fixed"
            top={0}
            left={0}
            w="100vw"
            h="100vh"
            bg="blackAlpha.600"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={1000}
          >
            <Box bg="white" p={8} borderRadius="md" minW="350px" boxShadow="lg" pos="relative">
              <Button
                pos="absolute"
                top={2}
                right={2}
                size="sm"
                onClick={() => setShowModal(false)}
              >
                X
              </Button>
              <Heading size="md" mb={4}>Criar Novo Participante</Heading>
              <Stack gap={4}>
                <Box>
                  <Text mb={1}>Nome</Text>
                  <Input
                    value={novoParticipante.nome}
                    onChange={(e) => setNovoParticipante({ ...novoParticipante, nome: e.target.value })}
                    placeholder="Nome do participante"
                  />
                </Box>
                <Box>
                  <Text mb={1}>Filial</Text>
                  <Input
                    value={novoParticipante.filial}
                    onChange={(e) => setNovoParticipante({ ...novoParticipante, filial: e.target.value })}
                    placeholder="Filial"
                  />
                </Box>
                <Box>
                  <Text mb={1}>Nível de Ensino</Text>
                  <Input
                    value={novoParticipante.nivelEnsino}
                    onChange={(e) => setNovoParticipante({ ...novoParticipante, nivelEnsino: e.target.value })}
                    placeholder="Nível de Ensino"
                  />
                </Box>
                <Box>
                  <Text mb={1}>Período Letivo</Text>
                  <Input
                    value={novoParticipante.periodoLetivo}
                    onChange={(e) => setNovoParticipante({ ...novoParticipante, periodoLetivo: e.target.value })}
                    placeholder="Período Letivo"
                  />
                </Box>
                <Box>
                  <Text mb={1}>Matrícula</Text>
                  <Input
                    value={novoParticipante.matricula}
                    onChange={(e) => setNovoParticipante({ ...novoParticipante, matricula: e.target.value })}
                    placeholder="Matrícula do participante"
                  />
                </Box>
                <Box>
                  <Text mb={1}>Nome do Curso</Text>
                  <Input
                    value={novoParticipante.nomeCurso}
                    onChange={(e) => setNovoParticipante({ ...novoParticipante, nomeCurso: e.target.value })}
                    placeholder="Nome do Curso"
                  />
                </Box>
                <Box>
                  <Text mb={1}>Turno</Text>
                  <Input
                    value={novoParticipante.turno}
                    onChange={(e) => setNovoParticipante({ ...novoParticipante, turno: e.target.value })}
                    placeholder="Turno"
                  />
                </Box>
                <Box>
                  <Text mb={1}>E-mail Institucional</Text>
                  <Input
                    value={novoParticipante.emailInstitucional}
                    onChange={(e) => setNovoParticipante({ ...novoParticipante, emailInstitucional: e.target.value })}
                    placeholder="E-mail institucional"
                    type="email"
                  />
                </Box>
                <Box>
                  <Text mb={1}>E-mail Pessoal</Text>
                  <Input
                    value={novoParticipante.emailPessoal}
                    onChange={(e) => setNovoParticipante({ ...novoParticipante, emailPessoal: e.target.value })}
                    placeholder="E-mail pessoal"
                    type="email"
                  />
                </Box>
                <Box>
                  <Text mb={1}>Telefone</Text>
                  <Input
                    value={novoParticipante.fone}
                    onChange={(e) => setNovoParticipante({ ...novoParticipante, fone: e.target.value })}
                    placeholder="Telefone"
                  />
                </Box>
                <Box>
                  <Text mb={1}>Status no Período Letivo</Text>
                  <Input
                    value={novoParticipante.statusNoPeriodoLetivo}
                    onChange={(e) => setNovoParticipante({ ...novoParticipante, statusNoPeriodoLetivo: e.target.value })}
                    placeholder="Status no Período Letivo"
                  />
                </Box>
                <Box>
                  <label>
                    <input
                      type="checkbox"
                      checked={novoParticipante.aceitaContato}
                      onChange={e => setNovoParticipante({ ...novoParticipante, aceitaContato: e.target.checked })}
                    /> Aceita Contato
                  </label>
                </Box>
                <Button
                  colorScheme="teal"
                  onClick={handleCreate}
                  loading={loading}
                  width="full"
                >
                  Salvar
                </Button>
              </Stack>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
} 