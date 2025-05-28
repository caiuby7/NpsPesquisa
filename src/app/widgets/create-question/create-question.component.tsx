import {
  Box,
  Button,
  Field,
  Flex,
  Heading,
  Input,
  Stack,
} from "@chakra-ui/react";
import { useQuestionPostMutate } from "@/app/services/question";
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

export default function CreateQuestion() {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useCreateQuestionForm();

  const handleMutationSuccess = () => {
    router.push('/home')
  };

  const handleMutationError = () => {
    console.log("error");
  };

  const { mutate: questionPost } = useQuestionPostMutate(
    handleMutationSuccess,
    handleMutationError
  );

  const type = watch("tipo");

  const onSubmit = (data: FormSchemaType) => {
    if (data.tipo === QuestionTypeEnum.LINEAR_SCALE) {
      questionPost({
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
      });
      return;
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
                register={register}
                label="Tipo da questão"
                items={QUESTIONS_TYPES}
                placeholder="Selecione o Tipo da Questão"
                name={`tipo`}
              />
            </Flex>
            {type && (
              <QuestionTypeForm
                errors={errors}
                type={type[0] as QuestionType}
                register={register}
                setValue={setValue}
                getValues={getValues}
                control={control}
              />
            )}
          </Stack>
        </Box>
        <Button mt={8} colorScheme="blue" type="submit">
          Salvar questão
        </Button>
      </Stack>
    </form>
  );
}
