/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  ButtonGroup,
  Heading,
  IconButton,
  Stack,
  HStack,
  Button,
  Badge,
  Text,
  useToast,
} from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { MdEdit, MdDelete } from "react-icons/md";
import { Plus } from "lucide-react";
import { QuestionTypeExecution } from "../../features/execution/QuestionTypeExecution/question-type-execution.component";
import { useGetQuestions } from "../../services/question";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { QuestionService } from "../../services/question/question.services";
import { QuestionResponse } from "../../services/form/form.services.types";
import { useState } from "react";
import Pagination from "../../components/Pagination/pagination.component";

export default function QuestionsWidget() {
  const { register, control, watch } = useForm();
  const { data, refetch } = useGetQuestions();
  const navigate = useNavigate();
  const toast = useToast();
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
      // Confirmação antes de excluir
      if (window.confirm('Tem certeza que deseja excluir esta questão?')) {
        await QuestionService.delete(id);
        toast({
          title: "Questão excluída com sucesso!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        refetch();
      }
    } catch (error: any) {
      console.error("Erro ao excluir questão:", error);
      toast({
        title: "Erro ao excluir questão",
        description: error.response?.data?.message || "Não foi possível excluir a questão. Verifique se ela não está sendo usada em algum questionário.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Box p={6} maxW="1200px" mx="auto">
      <Box
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
        <Button
          colorScheme="blue"
          onClick={() => navigate('/create-question')}
          leftIcon={<Plus />}
        >
          Criar Questão
        </Button>
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
              <HStack justify="space-between" align="start" mb={2}>
                <Text fontSize="sm" color="gray.600">
                  ID: {question.id} | Tipo: {question.tipo}
                </Text>
                <HStack>
                  {question.obrigatorio && (
                    <Badge colorScheme="red" variant="subtle">
                      Obrigatório
                    </Badge>
                  )}
                  {question.isCondicional && (
                    <Badge colorScheme="purple" variant="subtle">
                      Condicional
                    </Badge>
                  )}
                </HStack>
              </HStack>
              
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
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={questions.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          showInfo={true}
          size="sm"
        />
      </Stack>
      </Box>
    </Box>
  );
}
