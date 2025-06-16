/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  ButtonGroup,
  Heading,
  IconButton,
  Stack,
  HStack,
  Button,
} from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { MdEdit, MdDelete } from "react-icons/md";
import { QuestionTypeExecution } from "../../features/execution/QuestionTypeExecution/question-type-execution.component";
import { useGetQuestions } from "../../services/question";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { QuestionService } from "../../services/question/question.services";
import { QuestionResponse } from "../../services/form/form.services.types";
import { useState } from "react";

export default function QuestionsWidget() {
  const { register, control, watch } = useForm();
  const { data, refetch } = useGetQuestions();
  const navigate = useNavigate();
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
    navigate(`/create-question/${id}`);
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
        {currentQuestions.map((question: QuestionResponse, index: number) => (
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
          <HStack justify="center" mt={4}>
            <IconButton
              aria-label="Página anterior"
              icon={<LuChevronLeft />}
              onClick={() => handlePageChange(currentPage - 1)}
              isDisabled={currentPage === 1}
            />
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page: number) => (
              <IconButton
                key={page}
                aria-label={`Ir para página ${page}`}
                variant={page === currentPage ? "solid" : "ghost"}
                onClick={() => handlePageChange(page)}
                size="sm"
              >
                {page}
              </IconButton>
            ))}
            <IconButton
              aria-label="Próxima página"
              icon={<LuChevronRight />}
              onClick={() => handlePageChange(currentPage + 1)}
              isDisabled={currentPage === totalPages}
            />
          </HStack>
        )}
      </Stack>
    </Box>
  );
}
