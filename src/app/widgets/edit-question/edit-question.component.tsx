/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Heading,
  Stack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Textarea,
  useToast,
  Checkbox,
  Text,
  Spinner,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import {
  useGetQuestionById,
  useQuestionPutMutate,
} from "../../services/question";
import {
  QuestionTypeEnum,
  QUESTIONS_TYPES,
} from "../../services/question";
import { FormSchemaType, useCreateQuestionForm } from "../create-question/useCreateQuestionForm";
import { CustomSelect } from "../../components/Select/select.component";
import { QuestionTypeForm } from "../../features/create/QuestionTypeForm/question-type-form.component";
import { useParams, useNavigate } from "react-router-dom";
import { OptionItem as FormOptionItem } from "../../services/form";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const convertOptionItem = (opt: FormOptionItem | { [key: string]: any }): any => ({
  texto: opt.texto || '',
  id: (opt as any).id ?? (opt as any).idOpcao ?? Math.random().toString(),
  ordem: opt.ordem || 0,
  peso: opt.peso || 0,
  valor: opt.valor || '',
  ehColuna: opt.ehColuna || false,
  ativaCondicao: opt.ativaCondicao || false,
  questaoCondicionalId: opt.questaoCondicionalId
});

const EditQuestionComponent: React.FC = () => {
  const { id } = useParams();
  const { data: question, isLoading, error } = useGetQuestionById(id as string);
  const {
    control,
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors },
  } = useCreateQuestionForm();

  const toast = useToast();
  const navigate = useNavigate();

  const [obrigatorio, setObrigatorio] = useState(false);
  const [isCondicional, setIsCondicional] = useState(false);

  // Estado para armazenar as opções originais
  const [originalOptions, setOriginalOptions] = useState<any[]>([]);
  const [hasLoadedData, setHasLoadedData] = useState(false);

  const type = watch("tipo");

  // Carregar dados da questão quando disponível
  useEffect(() => {
    if (question && id && !hasLoadedData) {
      let formData: any = {
        texto: question.texto,
        tipo: question.tipo,
        obrigatorio: question.obrigatorio || false,
        isCondicional: question.isCondicional || false,
      };
      setIsCondicional(question.isCondicional || false);
      setObrigatorio(question.obrigatorio || false);
      
      if (question.tipo === QuestionTypeEnum.MATRIX) {
        const opcoes = question.opcoes?.filter(opt => !opt.ehColuna).map(convertOptionItem) || [];
        const colunas = question.opcoes?.filter(opt => opt.ehColuna).map(convertOptionItem) || [];
        formData = {
          ...formData,
          opcoes,
          colunas,
        };
        setOriginalOptions([...opcoes, ...colunas]);
      } else if (question.tipo === QuestionTypeEnum.LINEAR_SCALE && question.opcoes && question.opcoes.length >= 2) {
        formData = {
          ...formData,
          ratingLabels: {
            min: question.opcoes[0].valor || "",
            max: question.opcoes[1].valor || "",
            minLabel: question.opcoes[0].texto || "",
            maxLabel: question.opcoes[1].texto || ""
          }
        };
      } else if ([QuestionTypeEnum.MULTIPLE_CHOICE, QuestionTypeEnum.MENU, QuestionTypeEnum.CHECKBOX].includes(question.tipo)) {
        const opcoes = question.opcoes?.map(convertOptionItem) || [];
        formData = {
          ...formData,
          opcoes,
        };
        setOriginalOptions(opcoes);
      }
      
      // Reset do formulário com os dados da questão
      reset(formData);
      setHasLoadedData(true);
    }
  }, [question, id, reset, setValue, hasLoadedData]);

  // Preservar opções quando o tipo muda
  useEffect(() => {
    if (hasLoadedData && originalOptions.length > 0) {
      const currentType = watch("tipo");
      if ([QuestionTypeEnum.MULTIPLE_CHOICE, QuestionTypeEnum.MENU, QuestionTypeEnum.CHECKBOX, QuestionTypeEnum.MATRIX].includes(currentType)) {
        // Verificar se as opções foram perdidas
        const currentOptions = getValues("opcoes") || [];
        if (currentOptions.length === 0 && originalOptions.length > 0) {
          // Restaurar as opções originais
          setValue("opcoes", originalOptions);
        }
      }
    }
  }, [type, hasLoadedData, originalOptions, setValue, getValues, watch]);

  const { mutate: questionPut, isPending } = useQuestionPutMutate(
    () => {
      toast({
        title: "Questão atualizada com sucesso!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate("/questions");
    },
    () => {
      toast({
        title: "Erro ao atualizar questão",
        description: "Tente novamente",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  );

  const onSubmit = (data: FormSchemaType) => {
    // Função para converter opções para o formato esperado pelo backend
    const toApiOption = (opt: any) => ({
      ...opt,
      idOpcao: String(opt.id ?? opt.idOpcao),
    });

    const formData = getValues();
    const obrigatorioValue = formData.obrigatorio || false;
    const isCondicionalValue = formData.isCondicional || false;

    if (data.tipo === QuestionTypeEnum.LINEAR_SCALE) {
      const payloadLinearScale = {
        ...data,
        obrigatorio: obrigatorioValue,
        isCondicional: isCondicionalValue,
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
      questionPut({ id: id as string, payload: payloadLinearScale });
      return;
    }
    if (data.tipo === QuestionTypeEnum.MATRIX) {
      const payloadArray = {
        ...data,
        obrigatorio: obrigatorioValue,
        isCondicional: isCondicionalValue,
        opcoes: [
          ...data.opcoes.map(toApiOption),
          ...data.colunas.map(toApiOption),
        ],
      };
      const { colunas, ...payloadWithoutColunas } = payloadArray;
      questionPut({ id: id as string, payload: payloadWithoutColunas });
      return;
    }

    const payload: any = {
      ...data,
      obrigatorio: obrigatorioValue,
      isCondicional: isCondicionalValue,
    };
    
    if ('opcoes' in data && Array.isArray(data.opcoes)) {
      payload.opcoes = data.opcoes.map(toApiOption);
    }

    questionPut({ id: id as string, payload });
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <Stack align="center" spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Carregando questão...</Text>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert status="error">
          <AlertIcon />
          Erro ao carregar questão: {error.message}
        </Alert>
      </Box>
    );
  }

  if (!question) {
    return (
      <Box p={4}>
        <Alert status="warning">
          <AlertIcon />
          Questão não encontrada
        </Alert>
      </Box>
    );
  }

  return (
    <Box maxW="800px" mx="auto" p={6}>
      <Heading mb={6} color="blue.600">
        Editar Questão
      </Heading>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={6}>
          <FormControl isInvalid={!!errors.texto}>
            <FormLabel>Título da questão</FormLabel>
            <Textarea
              {...register("texto")}
              placeholder="Digite o título da questão"
              rows={4}
              resize="vertical"
            />
            <FormErrorMessage>{errors.texto?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.tipo}>
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
              type={(type || question?.tipo) as any}
              register={register as any}
              setValue={setValue as any}
              getValues={getValues as any}
              control={control as any}
              isCondicional={isCondicional}
            />
          )}

          <FormControl mb={4}>
            <Checkbox
              isChecked={obrigatorio}
              onChange={e => {
                setObrigatorio(e.target.checked);
                setValue('obrigatorio', e.target.checked);
              }}
              colorScheme="blue"
            >
              Obrigatório?
            </Checkbox>
          </FormControl>

          <FormControl mb={4}>
            <Checkbox
              isChecked={isCondicional}
              onChange={e => {
                setIsCondicional(e.target.checked);
                setValue('isCondicional', e.target.checked);
              }}
              colorScheme="purple"
            >
              Questão Condicional?
            </Checkbox>
          </FormControl>

          <Button mt={8} colorScheme="blue" type="submit" isLoading={isPending}>
            Atualizar questão
          </Button>
          
          <Button mt={2} variant="outline" colorScheme="gray" onClick={() => navigate("/questions")}>
            Voltar
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default EditQuestionComponent;
