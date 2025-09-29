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
  Checkbox,
  Text,
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
  texto: opt.texto || '',
  id: (opt as any).id ?? (opt as any).idOpcao ?? Math.random().toString(),
  ordem: opt.ordem || 0,
  peso: opt.peso || 0,
  valor: opt.valor || '',
  ehColuna: opt.ehColuna || false,
  ativaCondicao: opt.ativaCondicao || false,
  questaoCondicionalId: opt.questaoCondicionalId
});

const CreateQuestionComponent: React.FC = () => {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useCreateQuestionForm();

  const toast = useToast();
  const navigate = useNavigate();

  const [obrigatorio, setObrigatorio] = useState(false);
  const [isCondicional, setIsCondicional] = useState(false);


  const handleMutationSuccess = () => {
    toast({
      title: "Questão salva com sucesso!",
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top"
    });
    navigate("/questions");
  };


  const { mutate: questionPost, isPending } = useQuestionPostMutate(
    handleMutationSuccess,
    () => {
      toast({
        title: "Erro ao salvar questão",
        description: "Tente novamente",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  );

  const type = watch("tipo");

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
      questionPost(payloadLinearScale);
      return;
    }
    if (data.tipo === QuestionTypeEnum.MATRIX) {
      const payloadArray = {
        ...data,
        obrigatorio: obrigatorioValue,
        isCondicional: isCondicionalValue,
        opcoes: data.opcoes.concat(
          data.colunas.map((item) => {
            return { ...item, ehColuna: true };
          })
        ).map(toApiOption),
      };
      const { colunas, ...payloadWithoutColunas } = payloadArray;
      questionPost(payloadWithoutColunas);
      return;
    }

    // Para os outros tipos
    const payload: any = { ...data };
    payload.obrigatorio = obrigatorioValue;
    payload.isCondicional = isCondicionalValue;
    if ('opcoes' in data && Array.isArray(data.opcoes)) {
      payload.opcoes = data.opcoes.map(toApiOption);
    }
    
    questionPost(payload as QuestionPostParams);
  };


  return (
    <Box p={6} maxW="1200px" mx="auto">
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
            {type && (
              <QuestionTypeForm
                errors={errors}
                type={type as QuestionType}
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
    </Box>
  );
};

export default CreateQuestionComponent;
