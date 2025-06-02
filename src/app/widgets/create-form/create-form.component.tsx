/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  Button,
  ButtonGroup,
  Heading,
  IconButton,
  Pagination,
  Stack,
} from "@chakra-ui/react";
import { useState } from "react";
import { RiArrowRightLine } from "react-icons/ri";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { QuestionTypeExecution } from "@/app/features/execution/QuestionTypeExecution/question-type-execution.component";
import { FirstStepForm } from "@/app/features/create/FirstStepForm/first-step-form.component";
import { useGetQuestions } from "@/app/services/question";
import { FirstStepFormValues } from "@/app/features/create/FirstStepForm/validationSchema";
import { useCreateForm } from "./useCreateQuestionForm";
import { useFormPostMutate } from "@/app/services/form";
import router from "next/router";


export default function ExecutionQuestion() {
  const { data } = useGetQuestions();
  const [toggle, setToggle] = useState(false);
  const { setValue, watch, register, getValues, control } = useCreateForm();

  const selectedIds: number[] = watch("questoes") || [];

  const toggleSelection = (id: number) => {
    const isSelected = selectedIds.includes(id);
    const updated = isSelected
      ? selectedIds.filter((i) => i !== id)
      : [...selectedIds, id];
    setValue("questoes", updated as never);
  };

  const onFirstStep = (data: FirstStepFormValues) => {
    setValue("titulo", data.titulo);
    setValue("descricao", data.descricao);
    setValue("dataExpiracao", data.dataExpiracao);
    setToggle(true);
  };

  const handleMutationSuccess = () => {
    router.push("/home");
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
    formPost({
      titulo: values.titulo,
      descricao: values.descricao,
      dataExpiracao: values.dataExpiracao,
      ordemAleatoria: true,
      questoes: values.questoes.map((item: number, index: number) => {
        return {
          questaoId: item,
          ordem: index + 1,
        };
      }),
    });
  };

  if (!data) return;

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
                loading={isPending}
              >
                {`Salvar formulário com ${selectedIds.length} questões`}{" "}
                <RiArrowRightLine />
              </Button>
            )}
          </Stack>

          <Stack>
            {data.map((question, index) => {
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
                      index={index} watch={watch} control={control as any} />
                  </Stack>
                </Box>
              );
            })}
            <Pagination.Root
              count={20}
              pageSize={2}
              defaultPage={1}
              w="100%"
              m="auto"
            >
              <ButtonGroup variant="ghost" size="sm">
                <Pagination.PrevTrigger asChild>
                  <IconButton>
                    <LuChevronLeft />
                  </IconButton>
                </Pagination.PrevTrigger>

                <Pagination.Items
                  render={(page) => (
                    <IconButton
                      variant={{ base: "ghost", _selected: "outline" }}
                    >
                      {page.value}
                    </IconButton>
                  )}
                />

                <Pagination.NextTrigger asChild>
                  <IconButton>
                    <LuChevronRight />
                  </IconButton>
                </Pagination.NextTrigger>
              </ButtonGroup>
            </Pagination.Root>
          </Stack>
        </>
      ) : (
        <FirstStepForm onSubmit={onFirstStep} />
      )}
    </Box>
  );
}
