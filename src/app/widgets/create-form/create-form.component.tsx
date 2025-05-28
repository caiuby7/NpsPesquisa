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
import { useGetForm } from "@/app/services/form/form.service.hooks";

import { RiArrowRightLine } from "react-icons/ri";
import { useForm } from "react-hook-form";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { QuestionTypeExecution } from "@/app/features/execution/QuestionTypeExecution/question-type-execution.component";
import { FirstStepForm } from "@/app/features/create/FirstStepForm/first-step-form.component";
import { useState } from "react";

export default function ExecutionQuestion() {
  const { data } = useGetForm({ id: "" });
  const [toggle, setToggle] = useState(false);
  const { control, setValue, watch, register, getValues } = useForm({
    defaultValues: {
      selectedQuestionIds: [], // seleção múltipla
    },
  });

  const selectedIds: string[] = watch("selectedQuestionIds") || [];

  const toggleSelection = (id: string) => {
    const isSelected = selectedIds.includes(id);
    const updated = isSelected
      ? selectedIds.filter((i) => i !== id)
      : [...selectedIds, id];

    setValue("selectedQuestionIds", updated as never);
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
              >
                {`Selecionar ${selectedIds.length} questões`}{" "}
                <RiArrowRightLine />
              </Button>
            )}
          </Stack>

          <Stack>
            {data?.questoes.map((question) => {
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
                      type={question.tipo}
                      question={question}
                      control={control as any}
                      register={register as any}
                      setValue={setValue as any}
                      getValues={getValues as any}
                    />
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
        <FirstStepForm onSubmit={() => setToggle(true)} />
      )}
    </Box>
  );
}
