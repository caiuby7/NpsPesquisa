import { useRouter } from "next/router";
import { Box, Button, Heading, Input, Stack, Spinner, HStack } from "@chakra-ui/react";
import { AppHeader } from "../src/app/features/header/header.component";
import { useGetForm, useUpdateForm } from "../src/app/services/form/form.service.hooks";
import { useEffect, useState } from "react";

export default function EditarFormularioPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: form, isLoading } = useGetForm({ id: typeof id === "string" ? id : "" });
  const { mutate: updateForm, isPending } = useUpdateForm();

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [ordemAleatoria, setOrdemAleatoria] = useState(false);

  useEffect(() => {
    if (form) {
      setTitulo(form.titulo || "");
      setDescricao(form.descricao || "");
      setDataInicio(form.dataInicio ? form.dataInicio.slice(0, 10) : "");
      setDataFim(form.dataFim ? form.dataFim.slice(0, 10) : "");
      setOrdemAleatoria(!!form.ordemAleatoria);
    }
  }, [form]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateForm(
      {
        id,
        titulo,
        descricao,
        dataInicio,
        dataFim,
        ordemAleatoria,
      },
      {
        onSuccess: () => {
          alert("Formulário atualizado!");
          router.push("/formularios");
        },
        onError: () => {
          alert("Erro ao atualizar");
        },
      }
    );
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <Box>
      <AppHeader />
      <Box p={8} maxW="720px" m="auto" display="flex" flexDirection="column">
        <Heading mb={8}>Editar Formulário</Heading>
        <form onSubmit={handleSubmit}>
          <Stack gap={4} maxW="500px" m="auto">
            <Input
              placeholder="Título"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              required
            />
            <Input
              placeholder="Descrição"
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              required
            />
            <Input
              type="date"
              placeholder="Data de início"
              value={dataInicio}
              onChange={e => setDataInicio(e.target.value)}
              required
            />
            <Input
              type="date"
              placeholder="Data de fim"
              value={dataFim}
              onChange={e => setDataFim(e.target.value)}
              required
            />
            <label style={{ display: "flex", alignItems: "center" }}>
              <input
                type="checkbox"
                checked={ordemAleatoria}
                onChange={e => setOrdemAleatoria(e.target.checked)}
                style={{ marginRight: 8, width: 18, height: 18 }}
              />
              Ordem Aleatória
              <span style={{ marginLeft: 8, color: ordemAleatoria ? 'green' : 'gray' }}>
                {ordemAleatoria ? 'Ativado' : 'Desativado'}
              </span>
            </label>
            <Button colorScheme="blue" type="submit" loading={isPending}>
              Salvar alterações
            </Button>
            <HStack justify="space-between">
              <Button colorScheme="gray" onClick={() => router.push("/formularios")}>Voltar</Button>
              <Button colorScheme="teal" onClick={() => router.push(`/editar-formulario/${id}/questoes`)}>Listar Questões</Button>
            </HStack>
          </Stack>
        </form>
      </Box>
    </Box>
  );
} 