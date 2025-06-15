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
import { useState } from "react";

export default function QuestionsWidget() {
  const { register, control, watch } = useForm();
  const { data, refetch } = useGetQuestions();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  if (!data) return null;

  const questions = Array.isArray(data) ? data : [];
  const totalPages = Math.ceil(questions.length / itemsPerPage);
  
  // Calcular o índice inicial e final para a página atual
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  // Obter apenas as questões da página atual
  const currentQuestions = questions.slice(startIndex, endIndex);

  const handleEdit = (id: string) => {
    router.push(`/create-question/${id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      await QuestionService.delete(id);
      refetch();
    } catch (error) {
      console.error("Erro ao excluir questão:", error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Box
      p={8}
      w="100%"
      maxW={{ base: "100%", md: "80%" }}
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
        {currentQuestions.map((question, index) => (
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
        {totalPages > 1 && (
          <Pagination.Root
            count={totalPages}
            pageSize={1}
            defaultPage={currentPage}
            w="100%"
            m="auto"
            onChange={page => handlePageChange(typeof page === "number" ? page : (page as any)?.value ?? 1)}
          >
            <ButtonGroup variant="ghost" size="sm">
              <Pagination.PrevTrigger asChild>
                <IconButton disabled={currentPage === 1}>
                  <LuChevronLeft />
                </IconButton>
              </Pagination.PrevTrigger>

              <Pagination.Items
                render={(page) => (
                  <IconButton
                    variant={page.value === currentPage ? "outline" : "ghost"}
                    onClick={() => handlePageChange(page.value)}
                  >
                    {String(page.value)}
                  </IconButton>
                )}
              />

              <Pagination.NextTrigger asChild>
                <IconButton disabled={currentPage === totalPages}>
                  <LuChevronRight />
                </IconButton>
              </Pagination.NextTrigger>
            </ButtonGroup>
          </Pagination.Root>
        )}
      </Stack>
    </Box>
  );
}
