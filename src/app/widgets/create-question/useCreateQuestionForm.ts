import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { QuestionTypeEnum } from "@/app/services/question";
import { ZodType } from "zod";

export const useCreateQuestionForm = () =>
  useForm<FormSchemaType>({
    resolver: zodResolver(schemaWithPreprocessing as unknown as ZodType<FormSchemaType>),
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: {
      tipo: QuestionTypeEnum.TEXT_BOX,
      texto: "",
    },
  });

export const optionSchema = z.object({
  id: z.string(),
  texto: z.string().min(1, "Titulo é obrigatório"),
  ordem: z.number(),
  peso: z.number(),
  valor: z.string().optional(),
  ehColuna: z.boolean().optional(),
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
      min: z.number(),
      max: z.number(),
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

const schemaWithPreprocessing = z.preprocess((data: unknown) => {
  const d = data as Record<string, unknown>;
  return {
    ...d,
    tipo: Array.isArray(d.tipo) ? d.tipo[0] : d.tipo,
    ratingLabels: d.ratingLabels && typeof d.ratingLabels === 'object' ? {
      ...(d.ratingLabels as Record<string, unknown>),
      max: Array.isArray((d.ratingLabels as Record<string, unknown>).max)
        ? ((d.ratingLabels as Record<string, unknown>).max as unknown[])[0]
        : (d.ratingLabels as Record<string, unknown>).max,
      min: Array.isArray((d.ratingLabels as Record<string, unknown>).min)
        ? ((d.ratingLabels as Record<string, unknown>).min as unknown[])[0]
        : (d.ratingLabels as Record<string, unknown>).min
    } : undefined
  };
}, formSchema);

export type FormSchemaType = z.infer<typeof formSchema>;
export type MultipleChoiceSchemaType = z.infer<typeof multiplaEscolhaSchema>;
export type EscalaLinearSchema = z.infer<typeof escalaLinearSchema>;
export type MatrixSchemaType = z.infer<typeof matrixSchema>;
