/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  Button,
  Field,
  Flex,
  Heading,
  Input,
  Stack,
} from "@chakra-ui/react";
import {
  useGetQuestionById,
  useQuestionPostMutate,
  useQuestionPutMutate,
} from "@/app/services/question";
import {
  QuestionPostParams,
  QUESTIONS_TYPES,
  QuestionType,
  QuestionTypeEnum,
} from "@/app/services/question";
import { FormSchemaType, useCreateQuestionForm } from "./useCreateQuestionForm";
import { CustomSelect } from "@/app/components/Select/select.component";
import { QuestionTypeForm } from "@/app/features/create/QuestionTypeForm/question-type-form.component";
import router from "next/router";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function CreateQuestion() {
  const params = useParams();
  const id = params?.id;
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

  useEffect(() => {
    if (question) {
      reset(question);
      setValue("tipo", question.tipo);

      if (question.tipo === QuestionTypeEnum.LINEAR_SCALE && question.opcoes) {
        setValue("ratingLabels.min", Number(question.opcoes[0].valor));
        setValue("ratingLabels.max", Number(question.opcoes[1].valor));
        setValue("ratingLabels.minLabel", question.opcoes[0].texto);
        setValue("ratingLabels.maxLabel", question.opcoes[1].texto);
      }
    }
  }, [question]);

  const handleMutationSuccess = () => {
    router.push("/home");
  };

  const handleMutationError = () => {
    console.log("error");
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
    if (data && id) {
      questionPut({ id: id as string, payload: data });
      return
    }

    questionPost(data as QuestionPostParams);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, console.log)}>
      <Stack maxW="720px" m="auto" display="flex" flexDirection="column" mt={8}>
        <Heading>Criar Questão</Heading>
        <Box borderWidth="1px" p={4} borderRadius="md">
          <Stack>
            <Flex d="row" gap={8}>
              <Box w="100%">
                <Field.Root invalid={!!errors.texto?.message}>
                  <Field.Label>Título da questão</Field.Label>
                  <Input
                    placeholder="Título da questão"
                    {...register(`texto`)}
                  />
                </Field.Root>
              </Box>
              <CustomSelect
                invalid={!!errors.tipo?.message}
                control={control}
                label="Tipo da questão"
                items={QUESTIONS_TYPES}
                placeholder="Selecione o Tipo da Questão"
                name="tipo"
              />
            </Flex>
            {(type || question?.tipo) && (
              <QuestionTypeForm
                errors={errors}
                type={question?.tipo || (type[0] as QuestionType)}
                register={register}
                setValue={setValue}
                getValues={getValues}
                control={control}
              />
            )}
          </Stack>
        </Box>
        <Button mt={8} colorScheme="blue" type="submit" loading={isPending}>
          Salvar questão
        </Button>
      </Stack>
    </form>
  );
}
