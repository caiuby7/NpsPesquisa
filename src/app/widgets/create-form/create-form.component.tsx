/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Heading,
  IconButton,
  Stack,
  Text,
  HStack,
  Spinner,
  Badge,
} from "@chakra-ui/react";
import { RiArrowRightLine } from "react-icons/ri";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { QuestionTypeExecution } from "../../features/execution/QuestionTypeExecution/question-type-execution.component";
import { FirstStepForm } from "../../features/create/FirstStepForm/first-step-form.component";
import { useGetQuestions } from "../../services/question";
import { FirstStepFormValues } from "../../features/create/FirstStepForm/validationSchema";
import { useCreateForm } from "./useCreateQuestionForm";
import { useFormPostMutate } from "../../services/form/form.service.hooks";
import { useNavigate } from "react-router-dom";


export default function ExecutionQuestion() {
  const { data } = useGetQuestions();
  const [toggle, setToggle] = useState(false);
  const { setValue, watch, register, getValues, control, handleSubmit, formState } = useCreateForm();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2; // Número de questões por página
  const navigate = useNavigate();

  const selectedIds: number[] = watch("questoes") || [];

  const toggleSelection = (id: number) => {
    const isSelected = selectedIds.includes(id);
    const updated = isSelected
      ? selectedIds.filter((i) => i !== id)
      : [...selectedIds, id];
    setValue("questoes", updated as never);
  };

  const onFirstStep = () => {
    setToggle(true);
  };

  const handleMutationSuccess = () => {
    navigate("/home");
  };

  const handleMutationError = () => {
    console.log("error");
  };

  const { mutate: formPost, isPending } = useFormPostMutate(
    handleMutationSuccess,
    handleMutationError
  );

  const onSubmit = () => {
    const values = getValues();
    const now = new Date().toISOString();
    formPost({
      titulo: values.titulo,
      descricao: values.descricao,
      dataExpiracao: values.dataFim,
      ordemAleatoria: true,
      textoBoasVindas: values.textoBoasVindas,
      templateEmailConvite: values.templateEmailConvite,
      templateEmailLembrete: values.templateEmailLembrete,
      lembrarACadaXDias: values.lembrarACadaXDias,
      enviarLembreteAutomatico: values.enviarLembreteAutomatico,
      enviarLembreteParaTodos: values.enviarLembreteParaTodos,
      questoes: (values.questoes ?? []).map((item: number, index: number) => {
        return {
          questaoId: item,
          ordem: index + 1,
        };
      }),
    });
  };

  if (!data) return;

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentQuestions = data.slice(startIndex, endIndex);

  return (
    <Box p={8} maxW="720px" m="auto" display="flex" flexDirection="column">
      {toggle ? (
        <>
          <Stack
            display="flex"
            justifyContent="space-between"
            flexDirection="row"
            mb={8}
          >
            <Heading>Criar Formulário</Heading>
            {selectedIds.length > 0 && (
              <Button
                variant="outline"
                borderColor={"blue.500"}
                color={"blue.500"}
                bg={"blue.50"}
                onClick={onSubmit}
                isLoading={isPending}
              >
                {`Salvar formulário com ${selectedIds.length} questões`} {" "}
                <RiArrowRightLine />
              </Button>
            )}
          </Stack>

          <Stack>
            {currentQuestions.map((question: any, index: number) => {
              const isSelected = selectedIds.includes(question.id);

              return (
                <Box
                  key={question.id}
                  borderWidth="1px"
                  p={4}
                  borderRadius="md"
                  borderColor={isSelected ? "blue.500" : "gray.200"}
                  bg={isSelected ? "blue.50" : "white"}
                  cursor="pointer"
                  onClick={() => toggleSelection(question.id)}
                >
                  <Stack>
                    <QuestionTypeExecution
                      disabled
                      type={question.tipo}
                      question={question}
                      register={register as any}
                      index={startIndex + index}
                      watch={watch as any}
                      control={control as any}
                    />
                  </Stack>
                </Box>
              );
            })}
            <HStack spacing={2} justify="center" mt={4}>
              <IconButton
                aria-label="Página anterior"
                icon={<LuChevronLeft />}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                isDisabled={currentPage === 1}
              />
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  size="sm"
                  variant={page === currentPage ? "solid" : "ghost"}
                  colorScheme={page === currentPage ? "blue" : undefined}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              <IconButton
                aria-label="Próxima página"
                icon={<LuChevronRight />}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                isDisabled={currentPage >= totalPages}
              />
            </HStack>
          </Stack>
        </>
      ) : (
        <FirstStepForm 
          onSubmit={onFirstStep}
          register={register}
          handleSubmit={handleSubmit}
          setValue={setValue}
          watch={watch}
          errors={formState.errors}
        />
      )}
    </Box>
  );
}
