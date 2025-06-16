/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Stack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import {
  useGetQuestionById,
  useQuestionPostMutate,
  useQuestionPutMutate,
} from "../../services/question";
import {
  QuestionPostParams,
  QUESTIONS_TYPES,
  QuestionType,
  QuestionTypeEnum,
  OptionItem as QuestionOptionItem,
} from "../../services/question";
import { FormSchemaType, useCreateQuestionForm } from "./useCreateQuestionForm";
import { CustomSelect } from "../../components/Select/select.component";
import { QuestionTypeForm } from "../../features/create/QuestionTypeForm/question-type-form.component";
import { useParams, useNavigate } from "react-router-dom";
import { OptionItem as FormOptionItem } from "../../services/form";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const convertOptionItem = (opt: FormOptionItem | { [key: string]: any }): any => ({
  texto: opt.texto,
  id: (opt as any).id ?? (opt as any).idOpcao,
  ordem: opt.ordem,
  peso: opt.peso,
  valor: opt.valor,
  ehColuna: opt.ehColuna
});

interface CreateQuestionComponentProps {
  initialData?: {
    id?: string;
  };
}

const CreateQuestionComponent: React.FC<CreateQuestionComponentProps> = ({ initialData }) => {
  const params = useParams();
  const id = initialData?.id || params?.id;
  const { data: question } = useGetQuestionById(id as string);
  const {
    control,
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors },
  } = useCreateQuestionForm(question);

  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (question) {
      let formData: any = {
        texto: question.texto,
        tipo: question.tipo,
      };
      if (question.tipo === QuestionTypeEnum.MATRIX) {
        formData = {
          texto: question.texto,
          tipo: question.tipo,
          opcoes: question.opcoes?.filter(opt => !opt.ehColuna).map(convertOptionItem) || [],
          colunas: question.opcoes?.filter(opt => opt.ehColuna).map(convertOptionItem) || [],
        };
      } else if (question.tipo === QuestionTypeEnum.LINEAR_SCALE && question.opcoes) {
        formData = {
          texto: question.texto,
          tipo: question.tipo,
          ratingLabels: {
            min: question.opcoes[0].valor || "",
            max: question.opcoes[1].valor || "",
            minLabel: question.opcoes[0].texto || "",
            maxLabel: question.opcoes[1].texto || ""
          }
        };
      } else if (question.tipo === QuestionTypeEnum.MULTIPLE_CHOICE) {
        formData = {
          texto: question.texto,
          tipo: question.tipo,
          opcoes: question.opcoes?.map(convertOptionItem) || [],
        };
      } else if (question.tipo === QuestionTypeEnum.MENU) {
        formData = {
          texto: question.texto,
          tipo: question.tipo,
          opcoes: question.opcoes?.map(convertOptionItem) || [],
        };
      }
      reset(formData);
    }
  }, [question, reset]);

  const handleMutationSuccess = () => {
    toast({
      title: "Questão salva com sucesso!",
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top"
    });
    reset();
  };

  const handleMutationError = () => {
    toast({
      title: "Erro ao salvar a questão. Tente novamente.",
      status: "error",
      duration: 3000,
      isClosable: true,
      position: "top"
    });
  };

  const { mutate: questionPost, isPending } = useQuestionPostMutate(
    handleMutationSuccess,
    handleMutationError
  );

  const { mutate: questionPut } = useQuestionPutMutate(
    handleMutationSuccess,
    handleMutationError
  );

  const type = watch("tipo");

  const onSubmit = (data: FormSchemaType) => {
    // Função para converter opções para o formato esperado pelo backend
    const toApiOption = (opt: any) => ({
      ...opt,
      idOpcao: String(opt.id ?? opt.idOpcao),
    });

    if (data.tipo === QuestionTypeEnum.LINEAR_SCALE) {
      const payloadLinearScale = {
        ...data,
        opcoes: [
          {
            texto: data.ratingLabels.minLabel,
            idOpcao: crypto.randomUUID(),
            peso: 1,
            ordem: 1,
            valor: String(data.ratingLabels.min),
          },
          {
            texto: data.ratingLabels.maxLabel,
            idOpcao: crypto.randomUUID(),
            peso: 1,
            valor: String(data.ratingLabels.max),
            ordem: 2,
          },
        ],
      };
      if (question && id) {
        questionPut({ id: id as string, payload: payloadLinearScale });
        return;
      }
      questionPost(payloadLinearScale);
      return;
    }
    if (data.tipo === QuestionTypeEnum.MATRIX) {
      const payloadArray = {
        ...data,
        opcoes: data.opcoes.concat(
          data.colunas.map((item) => {
            return { ...item, ehColuna: true };
          })
        ).map(toApiOption),
      };
      const { colunas, ...payloadWithoutColunas } = payloadArray;
      if (question && id) {
        questionPut({ id: id as string, payload: payloadWithoutColunas });
        return;
      }
      questionPost(payloadWithoutColunas);
      return;
    }

    // Para os outros tipos
    const payload: any = { ...data };
    if ('opcoes' in data && Array.isArray(data.opcoes)) {
      payload.opcoes = data.opcoes.map(toApiOption);
    }
    if (data && id) {
      questionPut({ id: id as string, payload });
      return;
    }
    questionPost(payload as QuestionPostParams);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, console.log)}>
      <Stack maxW="720px" m="auto" display="flex" flexDirection="column" mt={8}>
        <Heading>Criar Questão</Heading>
        <Box borderWidth="1px" p={4} borderRadius="md">
          <Stack>
            <FormControl isInvalid={!!errors.texto?.message} mb={4}>
              <FormLabel>Título da questão</FormLabel>
              <Textarea rows={4} {...register("texto")} />
              <FormErrorMessage>{errors.texto?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!errors.tipo?.message} mb={4}>
              <FormLabel>Tipo de questão</FormLabel>
              <CustomSelect
                invalid={!!errors.tipo?.message}
                control={control}
                items={QUESTIONS_TYPES}
                placeholder="Selecione o Tipo da Questão"
                name="tipo"
              />
              <FormErrorMessage>{errors.tipo?.message}</FormErrorMessage>
            </FormControl>
            {(type || question?.tipo) && (
              <QuestionTypeForm
                errors={errors}
                type={question?.tipo || (Array.isArray(type) ? type[0] : type) as QuestionType}
                register={register as any}
                setValue={setValue as any}
                getValues={getValues as any}
                control={control as any}
              />
            )}
          </Stack>
        </Box>
        <Button mt={8} colorScheme="blue" type="submit" isLoading={isPending}>
          Salvar questão
        </Button>
        <Button mt={2} variant="outline" colorScheme="gray" onClick={() => navigate(-1)}>
          Voltar
        </Button>
      </Stack>
    </form>
  );
};

export default CreateQuestionComponent;
