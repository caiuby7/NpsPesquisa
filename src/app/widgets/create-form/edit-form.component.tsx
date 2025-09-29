import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Heading,
  Stack,
  Input,
  Select,
  Checkbox,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { api } from "../../services/api";
import { ChangeEvent } from "react";

// Tipos simplificados para exemplo
interface Aluno {
  id: number;
  nome: string;
  filial: string;
  nivelEnsino: string;
  periodoLetivo: string;
  curso: { id: number; nome: string };
  statusNoPeriodoLetivo: string;
}

export default function EditForm({ formId }: { formId: number }) {
  const { register, setValue, handleSubmit, watch } = useForm();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [filtros, setFiltros] = useState({
    filial: "",
    nivelEnsino: "",
    periodoLetivo: "",
    curso: "",
    statusNoPeriodoLetivo: "",
  });
  const [participantes, setParticipantes] = useState<number[]>([]);

  // Buscar dados do formulário existente (mock)
  useEffect(() => {
    // TODO: Buscar dados do formulário pelo formId e preencher campos
  }, [formId]);

  // Buscar alunos com filtros
  useEffect(() => {
    const fetchAlunos = async () => {
      const res = await api.get("/Aluno");
      let data: Aluno[] = res.data;
      // Aplicar filtros
      Object.entries(filtros).forEach(([key, value]) => {
        if (value) {
          data = data.filter((a) => String((a as any)[key]) === value);
        }
      });
      setAlunos(data);
    };
    fetchAlunos();
  }, [filtros]);

  const onSubmit = (values: any) => {
    // Enviar PUT com participantesIds
    const payload = {
      ...values,
      participantesIds: participantes,
    };
    // TODO: Chamar endpoint de edição (PUT)
    console.log("Payload para edição:", payload);
  };

  return (
    <Box p={8} maxW="720px" m="auto" display="flex" flexDirection="column">
      <Heading mb={8}>Editar Formulário</Heading>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={4}>
          {/* Campos do formulário (exemplo) */}
          <Input placeholder="Título" {...register("titulo")} />
          <Input placeholder="Descrição" {...register("descricao")} />
          <Input type="date" placeholder="Data de Expiração" {...register("dataExpiracao")} />

          {/* Filtros */}
          <Stack direction="row" gap={2}>
            <Input placeholder="Filial" value={filtros.filial} onChange={e => setFiltros(f => ({ ...f, filial: e.target.value }))} />
            <Input placeholder="Nível Ensino" value={filtros.nivelEnsino} onChange={e => setFiltros(f => ({ ...f, nivelEnsino: e.target.value }))} />
            <Input placeholder="Período Letivo" value={filtros.periodoLetivo} onChange={e => setFiltros(f => ({ ...f, periodoLetivo: e.target.value }))} />
            <Input placeholder="Curso" value={filtros.curso} onChange={e => setFiltros(f => ({ ...f, curso: e.target.value }))} />
            <Input placeholder="Status" value={filtros.statusNoPeriodoLetivo} onChange={e => setFiltros(f => ({ ...f, statusNoPeriodoLetivo: e.target.value }))} />
          </Stack>

          {/* Multiselect de participantes */}
          <Box>
            <Heading as="h4" size="sm" mb={2}>Participantes</Heading>
            <Stack maxH="200px" overflowY="auto" borderWidth="1px" borderRadius="md" p={2}>
              {alunos.map(aluno => (
                <Box key={aluno.id} display="flex" alignItems="center" gap={2}>
                  <input
                    type="checkbox"
                    checked={participantes.includes(aluno.id)}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setParticipantes(prev =>
                        e.target.checked
                          ? [...prev, aluno.id]
                          : prev.filter(id => id !== aluno.id)
                      );
                    }}
                  />
                  <span>{aluno.nome} ({aluno.curso?.nome})</span>
                </Box>
              ))}
            </Stack>
          </Box>

          <Button colorScheme="blue" type="submit">Salvar alterações</Button>
        </Stack>
      </form>
    </Box>
  );
} 
