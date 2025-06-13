import { useRouter } from "next/router";
import { Box, Button, Heading, Stack, Checkbox, Spinner } from "@chakra-ui/react";
import { AppHeader } from "@/app/features/header/header.component";
import { useGetForm } from "@/app/services/form/form.service.hooks";
import { useGetQuestions } from "@/app/services/question";
import { useEffect, useState } from "react";

export default function EditarQuestoesFormularioPage() {
  const router = useRouter();
  const { id } = router.query;
  const formId = Array.isArray(id) ? id[0] : id || "";
  const { data: form, isLoading: loadingForm } = useGetForm({ id: formId });
  const { data: questions, isLoading: loadingQuestions } = useGetQuestions();
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    if (form && Array.isArray(form.questoesQuestionarios)) {
      setSelected(form.questoesQuestionarios.map((q: any) => q.questaoId));
    }
  }, [form]);

  const handleToggle = (questaoId: number) => {
    setSelected((prev) =>
      prev.includes(questaoId)
        ? prev.filter((id) => id !== questaoId)
        : [...prev, questaoId]
    );
  };

  const handleSalvar = () => {
    alert("Salvar questões selecionadas (implementar PUT no backend)");
    router.push(`/editar-formulario/${formId}`);
  };

  if (loadingForm || loadingQuestions) {
    return <Spinner />;
  }

  // Filtra questões duplicadas pelo id
  const uniqueQuestions = questions
    ? questions.filter((q: any, idx: number, arr: any[]) =>
        arr.findIndex((qq) => qq.id === q.id) === idx
      )
    : [];

  return (
    <Box>
      <AppHeader />
      <Box p={8} maxW="720px" m="auto" display="flex" flexDirection="column">
        <Heading mb={8}>Editar Questões do Formulário</Heading>
        <Stack gap={4} maxW="500px" m="auto">
          {uniqueQuestions && uniqueQuestions.length > 0 ? (
            uniqueQuestions.map((q: any) => (
              <Checkbox.Root
                key={q.id}
                checked={selected.includes(q.id)}
                onCheckedChange={() => handleToggle(q.id)}
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Checkbox.Label>{q.texto}</Checkbox.Label>
              </Checkbox.Root>
            ))
          ) : (
            <Box>Nenhuma questão encontrada.</Box>
          )}
          <Button colorScheme="blue" onClick={handleSalvar}>Salvar</Button>
          <Button colorScheme="gray" onClick={() => router.push(`/editar-formulario/${formId}`)}>Voltar</Button>
        </Stack>
      </Box>
    </Box>
  );
} 