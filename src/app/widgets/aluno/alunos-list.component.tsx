import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Heading,
  Stack,
  Input,
} from "@chakra-ui/react";
import axios from "axios";

interface Aluno {
  id: number;
  filial: string;
  nivelEnsino: string;
  periodoLetivo: string;
  nome: string;
  matricula: string;
  cursoId: number;
  curso: { id: number; nome: string };
  turno: string;
  emailInstitucional: string;
  emailPessoal: string;
  fone: string;
  statusNoPeriodoLetivo: string;
  aceitaContato: boolean;
}

export default function AlunosList() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [novoAluno, setNovoAluno] = useState<Partial<Aluno>>({});
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchAlunos();
  }, []);

  const fetchAlunos = async () => {
    const res = await axios.get("/api/aluno");
    setAlunos(res.data);
  };

  const handleNovoAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post("/api/aluno", novoAluno);
    setShowForm(false);
    setNovoAluno({});
    fetchAlunos();
  };

  const handleImport = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    await axios.post("/api/Aluno/import", formData);
    fetchAlunos();
  };

  return (
    <Box p={8} maxW="1200px" m="auto" display="flex" flexDirection="column">
      <Heading mb={8}>Alunos</Heading>
      <Stack direction="row" gap={4} mb={4}>
        <Button colorScheme="blue" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancelar" : "Criar novo aluno"}
        </Button>
        <Input type="file" accept=".xls,.xlsx" onChange={e => setFile(e.target.files?.[0] || null)} w="auto" />
        <Button colorScheme="green" onClick={handleImport} disabled={!file}>
          Importar via XLS
        </Button>
      </Stack>
      {showForm && (
        <Box borderWidth="1px" borderRadius="md" p={4} mb={4}>
          <form onSubmit={handleNovoAluno}>
            <Stack gap={2} direction="row" flexWrap="wrap">
              <Input placeholder="Filial" w="180px" value={novoAluno.filial || ""} onChange={e => setNovoAluno(a => ({ ...a, filial: e.target.value }))} />
              <Input placeholder="Nível Ensino" w="180px" value={novoAluno.nivelEnsino || ""} onChange={e => setNovoAluno(a => ({ ...a, nivelEnsino: e.target.value }))} />
              <Input placeholder="Período Letivo" w="180px" value={novoAluno.periodoLetivo || ""} onChange={e => setNovoAluno(a => ({ ...a, periodoLetivo: e.target.value }))} />
              <Input placeholder="Nome" w="180px" value={novoAluno.nome || ""} onChange={e => setNovoAluno(a => ({ ...a, nome: e.target.value }))} />
              <Input placeholder="Matrícula" w="180px" value={novoAluno.matricula || ""} onChange={e => setNovoAluno(a => ({ ...a, matricula: e.target.value }))} />
              <Input placeholder="Curso ID" w="120px" value={novoAluno.cursoId || ""} onChange={e => setNovoAluno(a => ({ ...a, cursoId: Number(e.target.value) }))} />
              <Input placeholder="Turno" w="120px" value={novoAluno.turno || ""} onChange={e => setNovoAluno(a => ({ ...a, turno: e.target.value }))} />
              <Input placeholder="Email Institucional" w="220px" value={novoAluno.emailInstitucional || ""} onChange={e => setNovoAluno(a => ({ ...a, emailInstitucional: e.target.value }))} />
              <Input placeholder="Email Pessoal" w="220px" value={novoAluno.emailPessoal || ""} onChange={e => setNovoAluno(a => ({ ...a, emailPessoal: e.target.value }))} />
              <Input placeholder="Fone" w="140px" value={novoAluno.fone || ""} onChange={e => setNovoAluno(a => ({ ...a, fone: e.target.value }))} />
              <Input placeholder="Status no Período Letivo" w="180px" value={novoAluno.statusNoPeriodoLetivo || ""} onChange={e => setNovoAluno(a => ({ ...a, statusNoPeriodoLetivo: e.target.value }))} />
              <Button colorScheme="blue" type="submit">Salvar</Button>
            </Stack>
          </form>
        </Box>
      )}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Filial</th>
            <th>Nível Ensino</th>
            <th>Período Letivo</th>
            <th>Matrícula</th>
            <th>Curso</th>
            <th>Turno</th>
            <th>Email Institucional</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {alunos.map(aluno => (
            <tr key={aluno.id}>
              <td>{aluno.id}</td>
              <td>{aluno.nome}</td>
              <td>{aluno.filial}</td>
              <td>{aluno.nivelEnsino}</td>
              <td>{aluno.periodoLetivo}</td>
              <td>{aluno.matricula}</td>
              <td>{aluno.curso?.nome}</td>
              <td>{aluno.turno}</td>
              <td>{aluno.emailInstitucional}</td>
              <td>{aluno.statusNoPeriodoLetivo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
} 