import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Heading,
  Text,
  Stack,
  Input,
  FormControl,
  FormLabel,
  Switch,
} from "@chakra-ui/react";
import { AppHeader } from "../../components/header/header.component";
import { useEffect, useState } from "react";
import { api } from "../../services/api";

interface Participante {
  id: number;
  nome: string;
  filial: string;
  nivelEnsino: string;
  periodoLetivo: string;
  matricula: string;
  nomeCurso: string;
  turno: string;
  emailInstitucional: string;
  emailPessoal: string;
  fone: string;
  statusNoPeriodoLetivo: string;
  aceitaContato: boolean;
}

export default function EditarParticipantePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [participante, setParticipante] = useState<Participante>({
    id: 0,
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
    fetchParticipante();
  }, [id]);

  async function fetchParticipante() {
    try {
      const res = await api.get(`/Aluno/${id}`);
      setParticipante(res.data);
    } catch (e) {
      alert("Erro ao buscar participante");
      navigate("/participantes");
    }
  }

  const handleSubmit = async () => {
    if (!participante.nome || !participante.matricula) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      await api.put(`/Aluno/${id}`, participante);
      alert("Participante atualizado com sucesso!");
      navigate("/participantes");
    } catch (e) {
      alert("Erro ao atualizar participante");
    }
    setLoading(false);
  };

  return (
    <Box>
      <AppHeader />
      <Box p={8} maxW="800px" m="auto">
        <Stack spacing={8}>
          <Heading size="lg">Editar Participante</Heading>

          <FormControl>
            <FormLabel>Nome</FormLabel>
            <Input
              value={participante.nome}
              onChange={(e) => setParticipante({ ...participante, nome: e.target.value })}
              placeholder="Nome do participante"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Filial</FormLabel>
            <Input
              value={participante.filial}
              onChange={(e) => setParticipante({ ...participante, filial: e.target.value })}
              placeholder="Filial"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Nível de Ensino</FormLabel>
            <Input
              value={participante.nivelEnsino}
              onChange={(e) => setParticipante({ ...participante, nivelEnsino: e.target.value })}
              placeholder="Nível de Ensino"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Período Letivo</FormLabel>
            <Input
              value={participante.periodoLetivo}
              onChange={(e) => setParticipante({ ...participante, periodoLetivo: e.target.value })}
              placeholder="Período Letivo"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Matrícula</FormLabel>
            <Input
              value={participante.matricula}
              onChange={(e) => setParticipante({ ...participante, matricula: e.target.value })}
              placeholder="Matrícula do participante"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Nome do Curso</FormLabel>
            <Input
              value={participante.nomeCurso}
              onChange={(e) => setParticipante({ ...participante, nomeCurso: e.target.value })}
              placeholder="Nome do Curso"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Turno</FormLabel>
            <Input
              value={participante.turno}
              onChange={(e) => setParticipante({ ...participante, turno: e.target.value })}
              placeholder="Turno"
            />
          </FormControl>

          <FormControl>
            <FormLabel>E-mail Institucional</FormLabel>
            <Input
              value={participante.emailInstitucional}
              onChange={(e) => setParticipante({ ...participante, emailInstitucional: e.target.value })}
              placeholder="E-mail Institucional"
              type="email"
            />
          </FormControl>

          <FormControl>
            <FormLabel>E-mail Pessoal</FormLabel>
            <Input
              value={participante.emailPessoal}
              onChange={(e) => setParticipante({ ...participante, emailPessoal: e.target.value })}
              placeholder="E-mail Pessoal"
              type="email"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Telefone</FormLabel>
            <Input
              value={participante.fone}
              onChange={(e) => setParticipante({ ...participante, fone: e.target.value })}
              placeholder="Telefone"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Status no Período Letivo</FormLabel>
            <Input
              value={participante.statusNoPeriodoLetivo}
              onChange={(e) => setParticipante({ ...participante, statusNoPeriodoLetivo: e.target.value })}
              placeholder="Status no Período Letivo"
            />
          </FormControl>

          <FormControl display="flex" alignItems="center">
            <FormLabel mb="0">Aceita Contato</FormLabel>
            <Switch
              isChecked={participante.aceitaContato}
              onChange={(e) => setParticipante({ ...participante, aceitaContato: e.target.checked })}
            />
          </FormControl>

          <Stack direction="row" spacing={4} justify="flex-end">
            <Button onClick={() => navigate("/participantes")}>
              Cancelar
            </Button>
            <Button
              colorScheme="teal"
              onClick={handleSubmit}
              isLoading={loading}
            >
              Salvar Alterações
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
} 