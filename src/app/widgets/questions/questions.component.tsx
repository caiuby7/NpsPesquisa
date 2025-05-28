/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  ButtonGroup,
  Heading,
  IconButton,
  Pagination,
  Stack,
} from "@chakra-ui/react";

import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { QuestionTypeExecution } from "@/app/features/execution/QuestionTypeExecution/question-type-execution.component";
import { useGetQuestions } from "@/app/services/question";
import { useForm } from "react-hook-form";

export default function QuestionsWidget() {
  const { data } = useGetQuestions();
  const { register, control } = useForm();

  if (!data) return;

  return (
    <Box p={8} maxW="720px" m="auto" display="flex" flexDirection="column">
      <Stack
        display="flex"
        justifyContent="space-between"
        flexDirection="row"
        mb={8}
      >
        <Heading>Questões</Heading>
      </Stack>

      <Stack>
        {data.map((question, index) => (
          <Box
            key={question.id}
            borderWidth="1px"
            p={4}
            borderRadius="md"
            cursor="pointer"
          >
            <Stack>
              <QuestionTypeExecution
                disabled
                type={question.tipo}
                question={question}
                control={control as any}
                register={register as any}
                index={index}
              />
            </Stack>
          </Box>
        ))}
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
                <IconButton variant={{ base: "ghost", _selected: "outline" }}>
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
    </Box>
  );
}
