// pages/form-builder.tsx
import {
  Box,
  Button,
  Input,
  Stack,
  Heading,
  Flex,
} from "@chakra-ui/react";
import { useForm, useFieldArray } from "react-hook-form";
import { QuestionTypeForm } from "../app/components/QuestionTypeForm/question-type-form.component";
import { useColorMode } from "@/components/ui/color-mode";
import { CustomSelect } from "@/app/components/Select/select.component";
/*

*/
export default function FormBuilderPage() {
  const { control, register, handleSubmit, watch } = useForm({
    defaultValues: {
      questions: [
        { title: "", type: "text_box", options: [] }, // valor inicial
      ],
    },
  });

  const { toggleColorMode } = useColorMode()

  const { fields, append } = useFieldArray({
    control,
    name: "questions",
  });

  const questions = watch("questions");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = (data: any) => {
    console.log("Form data:", data);
  };

  return (
    <Box p={8}>
      <Button variant="outline" onClick={toggleColorMode} alignSelf="end" mb="12px">  
        Toggle Mode
      </Button>
      <Heading mb={6}>Criar Formulário</Heading>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          {fields.map((field, index) => (
            <Box key={field.id} borderWidth="1px" p={4} borderRadius="md">
              <Stack>
                <Flex d="row" gap={8}>
                  <Box w="100%">
                    <label>Título da questão</label>
                    <Input
                      title="Título da questão"
                      placeholder="Título da questão"
                      {...register(`questions.${index}.title`)}
                    />
                  </Box>


                  <CustomSelect />
                </Flex>


                {/* Renderiza o tipo específico de componente para a questão */}
                <QuestionTypeForm
                  type={questions[index]?.type}
                  index={index}
                  register={register}
                  control={control}
                />


              </Stack>
            </Box>
          ))}
          <Button
            onClick={() =>
              append({ title: "", type: "text_box", options: [] })
            }
          >
            Adicionar questão
          </Button>
        </Stack>

        <Button mt={8} colorScheme="blue" type="submit">
          Salvar formulário
        </Button>
      </form>
    </Box>
  );
}
