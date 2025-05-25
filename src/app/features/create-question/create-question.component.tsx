import { Box, Button, Flex, Input, Stack } from "@chakra-ui/react";
import { QuestionTypeForm } from "@/app/components/create/QuestionTypeForm/question-type-form.component";
import { useQuestionPostMutate } from "@/app/services/question/question.service.hooks";
import {
    QuestionPostParams,
    QUESTIONS_TYPES,
    QuestionType,
    QuestionTypeEnum,
} from "@/app/services/question";
import { FormSchemaType, useCreateQuestionForm } from "./useCreateQuestionForm";
import { CustomSelect } from "@/app/components/create/Select/select.component";

export default function CreateQuestion() {
    const { control, register, handleSubmit, setValue, getValues, watch } =
        useCreateQuestionForm();

    const handleMutationSuccess = () => {
        console.log("success");
    };

    const handleMutationError = () => {
        console.log("error");
    };

    const { mutate: questionPost, isPending } = useQuestionPostMutate(
        handleMutationSuccess,
        handleMutationError
    );

    const type = watch("tipo");

    console.log(type)

    const onSubmit = (data: FormSchemaType) => {
        if (data.tipo === QuestionTypeEnum.LINEAR_SCALE) {
            questionPost({
                ...data,
                opcoes: [
                    {
                        texto: data.ratingLabels.minLabel,
                        idOpcao: crypto.randomUUID(),
                        peso: 1,
                        ordem: data.ratingLabels.min,
                    },
                    {
                        texto: data.ratingLabels.maxLabel,
                        idOpcao: crypto.randomUUID(),
                        peso: 1,
                        ordem: data.ratingLabels.max,
                    },
                ],
            });
            return;
        }
        questionPost(data as QuestionPostParams);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Stack>
                <Box borderWidth="1px" p={4} borderRadius="md">
                    <Stack>
                        <Flex d="row" gap={8}>
                            <Box w="100%">
                                <label>Título da questão</label>
                                <Input
                                    title="Título da questão"
                                    placeholder="Título da questão"
                                    {...register(`texto`)}
                                />
                            </Box>
                            <CustomSelect
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
                                type={type[0] as QuestionType}
                                register={register}
                                setValue={setValue}
                                getValues={getValues}
                                control={control}
                            />
                        )}

                    </Stack>
                </Box>
            </Stack>

            <Button mt={8} colorScheme="blue" type="submit">
                Salvar questão
            </Button>
        </form>
    );
}
