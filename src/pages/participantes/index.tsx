import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Heading,
  Text,
  Stack,
  Flex,
  Input,
  HStack,
  Select,
  Badge,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { AppHeader } from "../../components/header/header.component";
import { useEffect, useState } from "react";
import { MdDelete, MdEdit, MdPersonAdd, MdRefresh } from "react-icons/md";
import { api } from "../../services/api";

// Enum para tipos de participante
enum TipoParticipante {
  Aluno = 0,
  Professor = 1,
  Funcionario = 2,
  Coordenador = 3,
}

// Interface atualizada para o modelo Participante
interface Participante {
  id: number;
  nome: string;
  email: string;
  tipo: TipoParticipante;
  ativo: boolean;
  cursoId?: number;
  matricula?: string;
  semestre?: number;
  departamento?: string;
  titulacao?: string;
  setor?: string;
  cargo?: string;
  telefone?: string;
  cpf?: string;
  dataNascimento?: string;
  dataCadastro: string;
  dataAtualizacao?: string;
  alunoId?: number;
  professorId?: number;
  coordenadorId?: number;
}

// Interface para criação de participante
interface NovoParticipante {
  nome: string;
  email: string;
  tipo: TipoParticipante;
  cursoId?: number;
  matricula?: string;
  semestre?: number;
  turno?: string;
  departamento?: string;
  titulacao?: string;
  especialidade?: string;
  areaAtuacao?: string;
  setor?: string;
  cargo?: string;
  telefone?: string;
  cpf?: string;
  dataNascimento?: string;
}

export default function ParticipantesPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Debug do estado do modal
  console.log("Estado atual do modal:", showModal);
  const [cursos, setCursos] = useState<Array<{id: number, nome: string}>>([]);
  const [novoParticipante, setNovoParticipante] = useState<NovoParticipante>({
    nome: "",
    email: "",
    tipo: TipoParticipante.Aluno,
    cursoId: undefined,
    matricula: "",
    semestre: undefined,
    turno: "",
    departamento: "",
    titulacao: "",
    especialidade: "",
    areaAtuacao: "",
    setor: "",
    cargo: "",
    telefone: "",
    cpf: "",
    dataNascimento: "",
  });

  useEffect(() => {
    fetchParticipantes();
    fetchCursos();
  }, []);

  async function fetchCursos() {
    try {
      const res = await api.get("/Curso");
      setCursos(res.data);
    } catch (e) {
      console.error("Erro ao buscar cursos:", e);
    }
  }

  async function fetchParticipantes() {
    setLoading(true);
    try {
      console.log("🔄 Buscando participantes...");
      const res = await api.get("/Participante");
      console.log("📊 Resposta da API:", res.data);
      setParticipantes(res.data);
      console.log("✅ Participantes atualizados:", res.data);
    } catch (e) {
      console.error("❌ Erro ao buscar participantes:", e);
      toast({
        title: "Erro ao buscar participantes",
        description: "Verifique a conexão com o servidor",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }

  const getTipoDescricao = (tipo: TipoParticipante): string => {
    switch (tipo) {
      case TipoParticipante.Aluno: return "Aluno";
      case TipoParticipante.Professor: return "Professor";
      case TipoParticipante.Funcionario: return "Funcionário";
      case TipoParticipante.Coordenador: return "Coordenador";
      default: return "Desconhecido";
    }
  };

  const getTipoColor = (tipo: TipoParticipante): string => {
    switch (tipo) {
      case TipoParticipante.Aluno: return "blue";
      case TipoParticipante.Professor: return "green";
      case TipoParticipante.Funcionario: return "orange";
      case TipoParticipante.Coordenador: return "purple";
      default: return "gray";
    }
  };

  const handleCreate = async () => {
    if (!novoParticipante.nome || !novoParticipante.email) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e email são obrigatórios",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      console.log("🚀 Enviando dados para criar participante:", novoParticipante);
      const response = await api.post("/Participante", novoParticipante);
      console.log("✅ Resposta da criação:", response.data);
      
      toast({
        title: "Participante criado com sucesso!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      setShowModal(false);
      setNovoParticipante({
        nome: "",
        email: "",
        tipo: TipoParticipante.Aluno,
        cursoId: undefined,
        matricula: "",
        semestre: undefined,
        turno: "",
        departamento: "",
        titulacao: "",
        especialidade: "",
        areaAtuacao: "",
        setor: "",
        cargo: "",
        telefone: "",
        cpf: "",
        dataNascimento: "",
      });
      
      console.log("🔄 Atualizando lista de participantes...");
      await fetchParticipantes();
      console.log("✅ Lista atualizada!");
    } catch (e: any) {
      console.error("❌ Erro ao criar participante:", e);
      const errorMessage = e.response?.data?.message || "Erro ao criar participante";
      toast({
        title: "Erro ao criar participante",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: number) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm("Tem certeza que deseja remover este participante?")) return;

    try {
      await api.delete(`/Participante/${id}`);
      toast({
        title: "Participante removido com sucesso!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchParticipantes();
    } catch (e: any) {
      const errorMessage = e.response?.data?.message || "Erro ao remover participante";
      toast({
        title: "Erro ao remover participante",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const resetForm = () => {
    setNovoParticipante({
      nome: "",
      email: "",
      tipo: TipoParticipante.Aluno,
      cursoId: undefined,
      matricula: "",
      semestre: undefined,
      turno: "",
      departamento: "",
      titulacao: "",
      especialidade: "",
      areaAtuacao: "",
      setor: "",
      cargo: "",
      telefone: "",
      cpf: "",
      dataNascimento: "",
    });
  };

  return (
    <Box>
      <AppHeader />
      <Box p={8} maxW="1200px" m="auto">
        <HStack justify="space-between" mb={8}>
          <Heading>Participantes</Heading>
          <HStack>
            <Button
              colorScheme="blue"
              variant="outline"
              onClick={fetchParticipantes}
              isLoading={loading}
            >
              <Box as={MdRefresh} mr={2} display="inline" /> Atualizar
            </Button>
            <Button
              colorScheme="teal"
              onClick={() => {
                console.log("Abrindo modal, showModal:", !showModal);
                setShowModal(true);
                console.log("Modal aberto, showModal agora é:", true);
              }}
            >
              <Box as={MdPersonAdd} mr={2} display="inline" /> Novo Participante
            </Button>
          </HStack>
        </HStack>

        {/* Loading state */}
        {loading && (
          <Box textAlign="center" py={8}>
            <Spinner size="xl" />
            <Text mt={4}>Carregando participantes...</Text>
          </Box>
        )}

        {/* Lista de participantes */}
        {!loading && (
          <Stack gap={4}>
            {participantes.length === 0 && (
              <Alert status="info">
                <AlertIcon />
                Nenhum participante encontrado.
              </Alert>
            )}
            {participantes.map((p: Participante) => (
              <Flex
                key={p.id}
                p={4}
                borderWidth={1}
                borderRadius="md"
                align="center"
                justify="space-between"
                bg="white"
                boxShadow="sm"
                _hover={{ boxShadow: "md" }}
                transition="all 0.2s"
              >
                <Box flex="1">
                  <HStack mb={2} align="center">
                    <Text fontWeight="bold" fontSize="lg">{p.nome}</Text>
                    <Badge colorScheme={getTipoColor(p.tipo)}>
                      {getTipoDescricao(p.tipo)}
                    </Badge>
                    <Badge colorScheme={p.ativo ? "green" : "red"}>
                      {p.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </HStack>
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    Email: {p.email}
                  </Text>
                  {p.matricula && (
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Matrícula: {p.matricula}
                    </Text>
                  )}
                  {p.departamento && (
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Departamento: {p.departamento}
                    </Text>
                  )}
                  {p.telefone && (
                    <Text fontSize="sm" color="gray.600">
                      Telefone: {p.telefone}
                    </Text>
                  )}
                </Box>
                <HStack>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    variant="outline"
                    onClick={() => navigate(`/participantes/${p.id}`)}
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
        )}

        {/* Modal de criação */}
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
            <Box 
              bg="white" 
              p={8} 
              borderRadius="md" 
              minW="500px" 
              maxH="90vh" 
              overflowY="auto" 
              boxShadow="lg" 
              pos="relative"
              zIndex={1001}
            >
              <Button
                pos="absolute"
                top={2}
                right={2}
                size="sm"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                X
              </Button>
              <Heading size="md" mb={6}>Criar Novo Participante</Heading>
              
              <Stack gap={4}>
                {/* Tipo de Participante */}
                <Box>
                  <Text mb={2} fontWeight="medium">Tipo de Participante *</Text>
                  <Select
                    value={novoParticipante.tipo}
                    onChange={(e) => setNovoParticipante({ 
                      ...novoParticipante, 
                      tipo: parseInt(e.target.value) as TipoParticipante 
                    })}
                  >
                    <option value={TipoParticipante.Aluno}>Aluno</option>
                    <option value={TipoParticipante.Professor}>Professor</option>
                    <option value={TipoParticipante.Funcionario}>Funcionário</option>
                    <option value={TipoParticipante.Coordenador}>Coordenador</option>
                  </Select>
                </Box>

                {/* Nome e Email */}
                <HStack>
                  <Box flex="1">
                    <Text mb={2} fontWeight="medium">Nome *</Text>
                    <Input
                      value={novoParticipante.nome}
                      onChange={(e) => setNovoParticipante({ ...novoParticipante, nome: e.target.value })}
                      placeholder="Nome completo"
                    />
                  </Box>
                  <Box flex="1">
                    <Text mb={2} fontWeight="medium">Email *</Text>
                    <Input
                      value={novoParticipante.email}
                      onChange={(e) => setNovoParticipante({ ...novoParticipante, email: e.target.value })}
                      placeholder="Email"
                      type="email"
                    />
                  </Box>
                </HStack>

                {/* Telefone, CPF e Data de Nascimento */}
                <HStack>
                  <Box flex="1">
                    <Text mb={2}>Telefone</Text>
                    <Input
                      value={novoParticipante.telefone || ""}
                      onChange={(e) => setNovoParticipante({ ...novoParticipante, telefone: e.target.value })}
                      placeholder="Telefone"
                    />
                  </Box>
                  <Box flex="1">
                    <Text mb={2}>CPF</Text>
                    <Input
                      value={novoParticipante.cpf || ""}
                      placeholder="CPF"
                      onChange={(e) => setNovoParticipante({ ...novoParticipante, cpf: e.target.value })}
                    />
                  </Box>
                  <Box flex="1">
                    <Text mb={2}>Data de Nascimento</Text>
                    <Input
                      value={novoParticipante.dataNascimento || ""}
                      onChange={(e) => setNovoParticipante({ ...novoParticipante, dataNascimento: e.target.value })}
                      placeholder="DD/MM/AAAA"
                      type="date"
                    />
                  </Box>
                </HStack>

                {/* Campos específicos por tipo */}
                {novoParticipante.tipo === TipoParticipante.Aluno && (
                  <>
                    <HStack>
                      <Box flex="1">
                        <Text mb={2}>Curso</Text>
                        <Select
                          value={novoParticipante.cursoId || ""}
                          onChange={(e) => setNovoParticipante({ 
                            ...novoParticipante, 
                            cursoId: e.target.value ? parseInt(e.target.value) : undefined 
                          })}
                          placeholder="Selecione o curso"
                        >
                          {cursos.map(curso => (
                            <option key={curso.id} value={curso.id}>{curso.nome}</option>
                          ))}
                        </Select>
                      </Box>
                      <Box flex="1">
                        <Text mb={2}>Matrícula</Text>
                        <Input
                          value={novoParticipante.matricula || ""}
                          onChange={(e) => setNovoParticipante({ ...novoParticipante, matricula: e.target.value })}
                          placeholder="Matrícula"
                        />
                      </Box>
                    </HStack>
                    <HStack>
                      <Box flex="1">
                        <Text mb={2}>Semestre</Text>
                        <Input
                          value={novoParticipante.semestre || ""}
                          onChange={(e) => setNovoParticipante({ 
                            ...novoParticipante, 
                            semestre: e.target.value ? parseInt(e.target.value) : undefined 
                          })}
                          placeholder="Semestre"
                          type="number"
                        />
                      </Box>
                      <Box flex="1">
                        <Text mb={2}>Turno</Text>
                        <Input
                          value={novoParticipante.turno || ""}
                          onChange={(e) => setNovoParticipante({ ...novoParticipante, turno: e.target.value })}
                          placeholder="Manhã/Tarde/Noite"
                        />
                      </Box>
                    </HStack>
                  </>
                )}

                {(novoParticipante.tipo === TipoParticipante.Professor || 
                  novoParticipante.tipo === TipoParticipante.Coordenador) && (
                  <>
                    <HStack>
                      <Box flex="1">
                        <Text mb={2}>Departamento</Text>
                        <Input
                          value={novoParticipante.departamento || ""}
                          onChange={(e) => setNovoParticipante({ ...novoParticipante, departamento: e.target.value })}
                          placeholder="Departamento"
                        />
                      </Box>
                      <Box flex="1">
                        <Text mb={2}>Titulação</Text>
                        <Input
                          value={novoParticipante.titulacao || ""}
                          onChange={(e) => setNovoParticipante({ ...novoParticipante, titulacao: e.target.value })}
                          placeholder="Titulação"
                        />
                      </Box>
                    </HStack>
                  </>
                )}

                {novoParticipante.tipo === TipoParticipante.Funcionario && (
                  <>
                    <HStack>
                      <Box flex="1">
                        <Text mb={2}>Setor</Text>
                        <Input
                          value={novoParticipante.setor || ""}
                          onChange={(e) => setNovoParticipante({ ...novoParticipante, setor: e.target.value })}
                          placeholder="Setor"
                        />
                      </Box>
                      <Box flex="1">
                        <Text mb={2}>Cargo</Text>
                        <Input
                          value={novoParticipante.cargo || ""}
                          onChange={(e) => setNovoParticipante({ ...novoParticipante, cargo: e.target.value })}
                          placeholder="Cargo"
                        />
                      </Box>
                    </HStack>
                  </>
                )}

                <HStack justify="space-between" pt={4}>
                  <Button
                    colorScheme="gray"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    colorScheme="teal"
                    onClick={handleCreate}
                    isLoading={loading}
                  >
                    Criar Participante
                  </Button>
                </HStack>
              </Stack>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
} 
