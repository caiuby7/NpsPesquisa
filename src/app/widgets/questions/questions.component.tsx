/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  ButtonGroup,
  Heading,
  IconButton,
  Pagination,
  Stack,
  HStack,
  Button,
} from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { MdEdit, MdDelete } from "react-icons/md";
import { QuestionTypeExecution } from "@/app/features/execution/QuestionTypeExecution/question-type-execution.component";
import { useGetQuestions } from "@/app/services/question";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { QuestionService } from "@/app/services/question/question.services";

export default function QuestionsWidget() {
  const { register, control, watch } = useForm();
  const { data, refetch } = useGetQuestions();
  const router = useRouter();

  if (!data) return;

  const handleEdit = (id: string) => {
    router.push(`/create-question?id=${id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      await QuestionService.delete(id);
      console.log("Questão excluída com sucesso");
      refetch();
    } catch (error) {
      console.error("Erro ao excluir questão:", error);
    }
  };

  return (
    <Box
      p={8}
      w="100%"
      maxW={{ base: "100%", md: "720px" }}
      mx="auto"
      display="flex"
      flexDirection="column"
    >
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
            w="100%"
            maxW="100%"
          >
            <Stack>
              <QuestionTypeExecution
                disabled
                type={question.tipo}
                question={question}
                register={register as any}
                index={index}
                watch={watch}
                control={control}
              />

              <HStack justify="flex-end" mt={2}>
                <Button
                  colorScheme="blue"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(String(question.id))}
                >
                  <MdEdit style={{ marginRight: "8px" }} />
                  Editar
                </Button>
                <Button
                  colorScheme="red"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(String(question.id))}
                >
                  <MdDelete style={{ marginRight: "8px" }} />
                  Excluir
                </Button>
              </HStack>
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
                  {String(page.value)}
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
