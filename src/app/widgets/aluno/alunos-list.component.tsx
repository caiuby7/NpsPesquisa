import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Heading,
  Stack,
  Input,
  Select,
  FormControl,
  FormLabel,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { api } from "../../../services/api";

interface Aluno {
  id: number;
  nome: string;
  matricula: string;
  cpf?: string;
  dataNascimento?: string;
  sexo?: number;
  email: string;
  emailPessoal?: string;
  telefone?: string;
  cursoId: number;
  curso: { id: number; nome: string };
  turmaId?: number;
  periodoLetivoId: number;
  instituicaoId: number;
  turno?: number;
  fase?: number;
  grade?: string;
  habilitacao?: string;
  dataIngressoCurso?: string;
  tipoMatricula?: number;
  dataMatricula?: string;
  statusNoPeriodoLetivo?: string;
  turmaAtiva: boolean;
  aceitaContato: boolean;
  ativo: boolean;
  integracaoId?: string;
  turmaDisciplinaIntegracaoId?: string;
  cursoIntegracaoId?: string;
  turmaIntegracaoId?: string;
  periodoLetivoIntegracaoId?: string;
  instituicaoIntegracaoId?: string;
  turmaDisciplinaIds: number[];
}

interface AlunoViewModel {
  nome: string;
  matricula: string;
  cpf?: string;
  dataNascimento?: string;
  sexo?: number;
  email: string;
  emailPessoal?: string;
  telefone?: string;
  cursoId: number;
  turmaId?: number;
  periodoLetivoId: number;
  instituicaoId: number;
  turno?: number;
  fase?: number;
  grade?: string;
  habilitacao?: string;
  dataIngressoCurso?: string;
  tipoMatricula?: number;
  dataMatricula?: string;
  statusNoPeriodoLetivo?: string;
  turmaAtiva: boolean;
  aceitaContato: boolean;
  ativo: boolean;
  integracaoId?: string;
  turmaDisciplinaIntegracaoId?: string;
  cursoIntegracaoId?: string;
  turmaIntegracaoId?: string;
  periodoLetivoIntegracaoId?: string;
  instituicaoIntegracaoId?: string;
  turmaDisciplinaIds: number[];
}

export default function AlunosList() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [novoAluno, setNovoAluno] = useState<Partial<AlunoViewModel>>({
    turmaAtiva: true,
    aceitaContato: true,
    ativo: true,
    turmaDisciplinaIds: []
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchAlunos();
  }, []);

  const fetchAlunos = async () => {
    const res = await api.get("/Aluno");
    setAlunos(res.data);
  };

  const handleNovoAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos obrigatórios
    if (!novoAluno.nome || !novoAluno.matricula || !novoAluno.email || !novoAluno.cursoId || !novoAluno.periodoLetivoId || !novoAluno.instituicaoId) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    try {
      // Preparar dados para envio, removendo campos vazios e garantindo tipos corretos
      const dadosParaEnvio: AlunoViewModel = {
        nome: novoAluno.nome!,
        matricula: novoAluno.matricula!,
        email: novoAluno.email!,
        cursoId: novoAluno.cursoId!,
        periodoLetivoId: novoAluno.periodoLetivoId!,
        instituicaoId: novoAluno.instituicaoId!,
        turmaAtiva: novoAluno.turmaAtiva ?? true,
        aceitaContato: novoAluno.aceitaContato ?? true,
        ativo: novoAluno.ativo ?? true,
        turmaDisciplinaIds: novoAluno.turmaDisciplinaIds ?? []
      };

      // Adicionar campos opcionais apenas se preenchidos
      if (novoAluno.cpf && novoAluno.cpf.trim()) {
        dadosParaEnvio.cpf = novoAluno.cpf.trim();
      }
      
      if (novoAluno.dataNascimento) {
        dadosParaEnvio.dataNascimento = novoAluno.dataNascimento;
      }
      
      if (novoAluno.sexo !== undefined && novoAluno.sexo !== null) {
        dadosParaEnvio.sexo = novoAluno.sexo;
      }
      
      if (novoAluno.emailPessoal && novoAluno.emailPessoal.trim()) {
        dadosParaEnvio.emailPessoal = novoAluno.emailPessoal.trim();
      }
      
      if (novoAluno.telefone && novoAluno.telefone.trim()) {
        dadosParaEnvio.telefone = novoAluno.telefone.trim();
      }
      
      if (novoAluno.turmaId) {
        dadosParaEnvio.turmaId = novoAluno.turmaId;
      }
      
      if (novoAluno.turno !== undefined && novoAluno.turno !== null) {
        dadosParaEnvio.turno = novoAluno.turno;
      }
      
      if (novoAluno.fase) {
        dadosParaEnvio.fase = novoAluno.fase;
      }
      
      if (novoAluno.grade && novoAluno.grade.trim()) {
        dadosParaEnvio.grade = novoAluno.grade.trim();
      }
      
      if (novoAluno.habilitacao && novoAluno.habilitacao.trim()) {
        dadosParaEnvio.habilitacao = novoAluno.habilitacao.trim();
      }
      
      if (novoAluno.dataIngressoCurso) {
        dadosParaEnvio.dataIngressoCurso = novoAluno.dataIngressoCurso;
      }
      
      if (novoAluno.tipoMatricula !== undefined && novoAluno.tipoMatricula !== null) {
        dadosParaEnvio.tipoMatricula = novoAluno.tipoMatricula;
      }
      
      if (novoAluno.dataMatricula) {
        dadosParaEnvio.dataMatricula = novoAluno.dataMatricula;
      }
      
      if (novoAluno.statusNoPeriodoLetivo && novoAluno.statusNoPeriodoLetivo.trim()) {
        dadosParaEnvio.statusNoPeriodoLetivo = novoAluno.statusNoPeriodoLetivo.trim();
      }
      
      if (novoAluno.integracaoId && novoAluno.integracaoId.trim()) {
        dadosParaEnvio.integracaoId = novoAluno.integracaoId.trim();
      }
      
      if (novoAluno.turmaDisciplinaIntegracaoId && novoAluno.turmaDisciplinaIntegracaoId.trim()) {
        dadosParaEnvio.turmaDisciplinaIntegracaoId = novoAluno.turmaDisciplinaIntegracaoId.trim();
      }
      
      if (novoAluno.cursoIntegracaoId && novoAluno.cursoIntegracaoId.trim()) {
        dadosParaEnvio.cursoIntegracaoId = novoAluno.cursoIntegracaoId.trim();
      }
      
      if (novoAluno.turmaIntegracaoId && novoAluno.turmaIntegracaoId.trim()) {
        dadosParaEnvio.turmaIntegracaoId = novoAluno.turmaIntegracaoId.trim();
      }
      
      if (novoAluno.periodoLetivoIntegracaoId && novoAluno.periodoLetivoIntegracaoId.trim()) {
        dadosParaEnvio.periodoLetivoIntegracaoId = novoAluno.periodoLetivoIntegracaoId.trim();
      }
      
      if (novoAluno.instituicaoIntegracaoId && novoAluno.instituicaoIntegracaoId.trim()) {
        dadosParaEnvio.instituicaoIntegracaoId = novoAluno.instituicaoIntegracaoId.trim();
      }

      console.log("Dados sendo enviados:", dadosParaEnvio);
      
      await api.post("/Aluno", dadosParaEnvio);
    setShowForm(false);
      setNovoAluno({
        turmaAtiva: true,
        aceitaContato: true,
        ativo: true,
        turmaDisciplinaIds: []
      });
    fetchAlunos();
      alert("Aluno criado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar aluno:", error);
      alert("Erro ao criar aluno. Verifique os dados e tente novamente.");
    }
  };

  const handleImport = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    await api.post("/Aluno/import", formData);
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
            <VStack spacing={4} align="stretch">
              <HStack spacing={4} wrap="wrap">
                <FormControl isRequired>
                  <FormLabel>Nome *</FormLabel>
                  <Input 
                    placeholder="Nome completo" 
                    value={novoAluno.nome || ""} 
                    onChange={e => setNovoAluno(a => ({ ...a, nome: e.target.value }))} 
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Matrícula *</FormLabel>
                  <Input 
                    placeholder="Matrícula" 
                    value={novoAluno.matricula || ""} 
                    onChange={e => setNovoAluno(a => ({ ...a, matricula: e.target.value }))} 
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>CPF</FormLabel>
                  <Input 
                    placeholder="CPF" 
                    value={novoAluno.cpf || ""} 
                    onChange={e => setNovoAluno(a => ({ ...a, cpf: e.target.value }))} 
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Sexo</FormLabel>
                  <Select 
                    placeholder="Selecione o sexo"
                    value={novoAluno.sexo || ""} 
                    onChange={e => setNovoAluno(a => ({ ...a, sexo: e.target.value ? Number(e.target.value) : undefined }))}
                  >
                    <option value="1">Masculino</option>
                    <option value="2">Feminino</option>
                  </Select>
                </FormControl>
              </HStack>

              <HStack spacing={4} wrap="wrap">
                <FormControl isRequired>
                  <FormLabel>Email *</FormLabel>
                  <Input 
                    type="email"
                    placeholder="Email institucional" 
                    value={novoAluno.email || ""} 
                    onChange={e => setNovoAluno(a => ({ ...a, email: e.target.value }))} 
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Email Pessoal</FormLabel>
                  <Input 
                    type="email"
                    placeholder="Email pessoal" 
                    value={novoAluno.emailPessoal || ""} 
                    onChange={e => setNovoAluno(a => ({ ...a, emailPessoal: e.target.value }))} 
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Telefone</FormLabel>
                  <Input 
                    placeholder="Telefone" 
                    value={novoAluno.telefone || ""} 
                    onChange={e => setNovoAluno(a => ({ ...a, telefone: e.target.value }))} 
                  />
                </FormControl>
              </HStack>

              <HStack spacing={4} wrap="wrap">
                <FormControl isRequired>
                  <FormLabel>Curso ID *</FormLabel>
                  <Input 
                    type="number"
                    placeholder="ID do Curso" 
                    value={novoAluno.cursoId || ""} 
                    onChange={e => setNovoAluno(a => ({ ...a, cursoId: Number(e.target.value) }))} 
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Turma ID</FormLabel>
                  <Input 
                    type="number"
                    placeholder="ID da Turma" 
                    value={novoAluno.turmaId || ""} 
                    onChange={e => setNovoAluno(a => ({ ...a, turmaId: e.target.value ? Number(e.target.value) : undefined }))} 
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Período Letivo ID *</FormLabel>
                  <Input 
                    type="number"
                    placeholder="ID do Período Letivo" 
                    value={novoAluno.periodoLetivoId || ""} 
                    onChange={e => setNovoAluno(a => ({ ...a, periodoLetivoId: Number(e.target.value) }))} 
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Instituição ID *</FormLabel>
                  <Input 
                    type="number"
                    placeholder="ID da Instituição" 
                    value={novoAluno.instituicaoId || ""} 
                    onChange={e => setNovoAluno(a => ({ ...a, instituicaoId: Number(e.target.value) }))} 
                  />
                </FormControl>
              </HStack>

              <HStack spacing={4} wrap="wrap">
                <FormControl>
                  <FormLabel>Turno</FormLabel>
                  <Select 
                    placeholder="Selecione o turno"
                    value={novoAluno.turno || ""} 
                    onChange={e => setNovoAluno(a => ({ ...a, turno: e.target.value ? Number(e.target.value) : undefined }))}
                  >
                    <option value="1">Matutino</option>
                    <option value="2">Vespertino</option>
                    <option value="3">Noturno</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Tipo de Matrícula</FormLabel>
                  <Select 
                    placeholder="Selecione o tipo"
                    value={novoAluno.tipoMatricula || ""} 
                    onChange={e => setNovoAluno(a => ({ ...a, tipoMatricula: e.target.value ? Number(e.target.value) : undefined }))}
                  >
                    <option value="1">Calouro</option>
                    <option value="2">Veterano</option>
                    <option value="3">Formando</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Status no Período Letivo</FormLabel>
                  <Input 
                    placeholder="Status" 
                    value={novoAluno.statusNoPeriodoLetivo || ""} 
                    onChange={e => setNovoAluno(a => ({ ...a, statusNoPeriodoLetivo: e.target.value }))} 
                  />
                </FormControl>
              </HStack>

              <HStack spacing={4}>
              <Button colorScheme="blue" type="submit">Salvar</Button>
                <Button onClick={() => setShowForm(false)}>Cancelar</Button>
              </HStack>
            </VStack>
          </form>
        </Box>
      )}
      <Box overflowX="auto">
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0' }}>
          <thead style={{ backgroundColor: '#f7fafc' }}>
            <tr>
              <th style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'left' }}>Nome</th>
              <th style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'left' }}>Matrícula</th>
              <th style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'left' }}>Curso</th>
              <th style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'left' }}>Turno</th>
              <th style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'left' }}>Ativo</th>
          </tr>
        </thead>
        <tbody>
          {alunos.map(aluno => (
              <tr key={aluno.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{aluno.id}</td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{aluno.nome}</td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{aluno.matricula}</td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{aluno.email}</td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{aluno.curso?.nome || 'N/A'}</td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                  {aluno.turno === 1 ? 'Matutino' : aluno.turno === 2 ? 'Vespertino' : aluno.turno === 3 ? 'Noturno' : 'N/A'}
                </td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{aluno.statusNoPeriodoLetivo || 'N/A'}</td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    backgroundColor: aluno.ativo ? '#c6f6d5' : '#fed7d7',
                    color: aluno.ativo ? '#22543d' : '#742a2a'
                  }}>
                    {aluno.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
            </tr>
          ))}
        </tbody>
      </table>
      </Box>
    </Box>
  );
} 
