import {
  Box,
  Button,
  Field,
  Heading,
  Input,
  Stack,
} from "@chakra-ui/react";
import { useQuestionPostMutate } from "@/app/services/question";
import {
  QUESTIONS_TYPES,
  QuestionTypeEnum,
} from "@/app/services/question";
import { FormSchemaType, useCreateQuestionForm } from "@/app/widgets/create-question/useCreateQuestionForm";
import { CustomSelect } from "@/app/components/Select/select.component";
import { QuestionTypeForm } from "@/app/features/create/QuestionTypeForm/question-type-form.component";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { QuestionService } from "@/app/services/question/question.services";
import { SubmitHandler } from "react-hook-form";

export default function CreateQuestion() {
  const router = useRouter();
  const { id } = router.query;
  const isEditMode = typeof id === "string";

  const {
    control,
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useCreateQuestionForm();

  useEffect(() => {
    if (isEditMode) {
      const fetchQuestion = async () => {
        try {
          const questions = await QuestionService.get();
          const question = questions.find(q => q.id === Number(id));
          if (question) {
            setValue("tipo", question.tipo);
            setValue("texto", question.texto);
            if (question.tipo === QuestionTypeEnum.LINEAR_SCALE && question.opcoes) {
              setValue('ratingLabels.min', Number(question.opcoes[0].valor));
              setValue('ratingLabels.max', Number(question.opcoes[1].valor));
              setValue('ratingLabels.minLabel', question.opcoes[0].texto);
              setValue('ratingLabels.maxLabel', question.opcoes[1].texto);
            }
            if (question.tipo === QuestionTypeEnum.MATRIX) {
              setValue('opcoes', question.opcoes || []);
              setValue('colunas', question.colunas || []);
            }
            if ((question.tipo === QuestionTypeEnum.MULTIPLE_CHOICE || question.tipo === QuestionTypeEnum.MENU) && question.opcoes) {
              setValue('opcoes', question.opcoes);
            }
          }
        } catch {
          console.error("Erro ao carregar questão");
        }
      };
      fetchQuestion();
    }
  }, [id, isEditMode, setValue]);

  const handleMutationSuccess = () => {
    console.log("Questão atualizada com sucesso");
    router.push('/questions');
  };

  const handleMutationError = () => {
    console.error("Erro ao atualizar questão");
  };

  const { mutate: questionPost, isPending } = useQuestionPostMutate(
    handleMutationSuccess,
    handleMutationError
  );

  const type = watch("tipo");

  const onSubmit: SubmitHandler<FormSchemaType> = async (data) => {
    try {
      if (isEditMode && id) {
        if (data.tipo === QuestionTypeEnum.LINEAR_SCALE) {
          const questions = await QuestionService.get();
          const question = questions.find(q => q.id === Number(id));
          const minId = question?.opcoes?.[0]?.id || crypto.randomUUID();
          const maxId = question?.opcoes?.[1]?.id || crypto.randomUUID();
          await QuestionService.put(String(id), {
            texto: data.texto,
            tipo: data.tipo,
            opcoes: [
              {
                texto: data.ratingLabels.minLabel,
                idOpcao: minId,
                peso: 1,
                ordem: 1,
                valor: String(data.ratingLabels.min),
              },
              {
                texto: data.ratingLabels.maxLabel,
                idOpcao: maxId,
                peso: 1,
                valor: String(data.ratingLabels.max),
                ordem: 2,
              },
            ],
          });
        } else if (data.tipo === QuestionTypeEnum.MATRIX) {
          const opcoes = [
            ...data.opcoes.map((opcao, index) => ({
              texto: opcao.texto,
              idOpcao: opcao.id,
              ordem: index + 1,
              peso: opcao.peso,
              ehColuna: false
            })),
            ...data.colunas.map((coluna, index) => ({
              texto: coluna.texto,
              idOpcao: coluna.id,
              ordem: index + 1,
              peso: coluna.peso,
              ehColuna: true
            }))
          ];
          await QuestionService.put(String(id), {
            texto: data.texto,
            tipo: data.tipo,
            opcoes
          });
        } else if (data.tipo === QuestionTypeEnum.MULTIPLE_CHOICE || data.tipo === QuestionTypeEnum.MENU) {
          await QuestionService.put(String(id), {
            texto: data.texto,
            tipo: data.tipo,
            opcoes: data.opcoes.map(opcao => ({
              texto: opcao.texto,
              idOpcao: opcao.id,
              ordem: opcao.ordem,
              peso: opcao.peso,
            })),
          });
        } else {
          await QuestionService.put(String(id), {
            texto: data.texto,
            tipo: data.tipo,
          });
        }
      } else {
        if (data.tipo === QuestionTypeEnum.LINEAR_SCALE) {
          questionPost({
            texto: data.texto,
            tipo: data.tipo,
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
        } else if (data.tipo === QuestionTypeEnum.MATRIX) {
          const opcoes = [
            ...data.opcoes.map((opcao, index) => ({
              texto: opcao.texto,
              idOpcao: opcao.id,
              ordem: index + 1,
              peso: opcao.peso,
              ehColuna: false
            })),
            ...data.colunas.map((coluna, index) => ({
              texto: coluna.texto,
              idOpcao: coluna.id,
              ordem: index + 1,
              peso: coluna.peso,
              ehColuna: true
            }))
          ];

          questionPost({
            texto: data.texto,
            tipo: data.tipo,
            opcoes
          });
        } else if (data.tipo === QuestionTypeEnum.MULTIPLE_CHOICE || data.tipo === QuestionTypeEnum.MENU) {
          questionPost({
            texto: data.texto,
            tipo: data.tipo,
            opcoes: data.opcoes.map(opcao => ({
              texto: opcao.texto,
              idOpcao: opcao.id,
              ordem: opcao.ordem,
              peso: opcao.peso,
            })),
          });
        } else {
          questionPost({
            texto: data.texto,
            tipo: data.tipo,
          });
        }
      }
      router.push("/questions");
    } catch {
      console.error("Erro ao salvar questão");
    }
  };

  return (
    <Box p={8} maxW="720px" m="auto" display="flex" flexDirection="column">
      <Stack
        display="flex"
        justifyContent="space-between"
        flexDirection="row"
        mb={8}
      >
        <Heading>{isEditMode ? 'Editar Questão' : 'Criar Questão'}</Heading>
      </Stack>

      <Stack as="form" onSubmit={handleSubmit(onSubmit)} gap={4}>
        <Field.Root invalid={errors?.tipo && !!errors.tipo}>
          <CustomSelect
            control={control}
            items={QUESTIONS_TYPES}
            name="tipo"
          />
        </Field.Root>

        <Field.Root invalid={errors?.texto && !!errors.texto}>
          <Input
            placeholder="Título da questão"
            {...register("texto")}
          />
        </Field.Root>

        {type && (
          <QuestionTypeForm
            type={type}
            register={register}
            control={control}
            getValues={getValues}
            setValue={setValue}
            errors={errors}
          />
        )}

        <Button
          type="submit"
          colorScheme="blue"
          loading={isPending}
          loadingText={isEditMode ? "Salvando..." : "Criando..."}
        >
          {isEditMode ? "Salvar" : "Criar"}
        </Button>
      </Stack>
    </Box>
  );
}
