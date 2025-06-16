/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { QuestionTypeEnum } from "../../services/question";
import { ZodType } from "zod";
import { QuestionResponse } from "../../services/form";

export const useCreateQuestionForm = (question?: QuestionResponse) =>
  useForm<FormSchemaType>({
    resolver: zodResolver(schemaWithPreprocessing as any),
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: {
      texto: question?.texto,
      tipo: question?.tipo
    },
  });

export const optionSchema = z.object({
  id: z.string(),
  texto: z.string().min(1, "Titulo é obrigatório"),
  ordem: z.number(),
  peso: z.number(),
  valor: z.string().optional(),
  ehColuna: z.boolean().default(false),
});

const tipoBase = z.object({
  tipo: z.nativeEnum(QuestionTypeEnum),
  texto: z.string().min(1, "Titulo é obrigatório"),
});

const matrixSchema = tipoBase.merge(
  z.object({
    tipo: z.literal(QuestionTypeEnum.MATRIX),
    opcoes: z.array(optionSchema),
    colunas: z.array(optionSchema),
  })
);

const escalaLinearSchema = tipoBase.merge(
  z.object({
    tipo: z.literal(QuestionTypeEnum.LINEAR_SCALE),
    ratingLabels: z.object({
      min: z.string(),
      max: z.string(),
      minLabel: z.string().min(1, "Descrição é obrigatório"),
      maxLabel: z.string().min(1, "Descrição é obrigatório"),
    }),
  })
);

const caixaTextoSchema = tipoBase.merge(
  z.object({
    tipo: z.literal(QuestionTypeEnum.TEXT_BOX),
  })
);

const multiplaEscolhaSchema = tipoBase.merge(
  z.object({
    tipo: z.literal(QuestionTypeEnum.MULTIPLE_CHOICE),
    opcoes: z.array(optionSchema),
  })
);

const menuSuspensoSchema = tipoBase.merge(
  z.object({
    tipo: z.literal(QuestionTypeEnum.MENU),
    opcoes: z.array(optionSchema),
  })
);

const formSchema = z.discriminatedUnion("tipo", [
  matrixSchema,
  escalaLinearSchema,
  caixaTextoSchema,
  multiplaEscolhaSchema,
  menuSuspensoSchema,
]);

export const schemaWithPreprocessing: any = z.preprocess((data: any) => {
  return {
    ...data,
    tipo: Array.isArray(data.tipo) ? data.tipo[0] : data.tipo,
    ratingLabels: data.ratingLabels && {
      ...data?.ratingLabels,
      max: Array.isArray(data?.ratingLabels.max) ? data.ratingLabels.max[0] : data.ratingLabels.max,
      min: Array.isArray(data?.ratingLabels?.min) ? data.ratingLabels.min[0] : data.ratingLabels.min
    }
  };
}, formSchema);

export type FormSchemaType = z.infer<typeof formSchema>;
export type MultipleChoiceSchemaType = z.infer<typeof multiplaEscolhaSchema>;
export type EscalaLinearSchema = z.infer<typeof escalaLinearSchema>;
export type MatrixSchemaType = z.infer<typeof matrixSchema>;
