import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, ZodType } from "zod";

export const useCreateQuestionForm = () =>
  useForm<FormSchemaType>({
    resolver: zodResolver(schemaWithPreprocessing),
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: {},
  });

export const optionSchema = z.object({
  idOpcao: z.string(),
  texto: z.string().min(1, "Titulo é obrigatório"),
  ordem: z.number(),
  peso: z.number(),
});

const tipoBase = z.object({
  tipo: z.array(z.string()).transform((val) => val[0]),
});

const matrixSchema = tipoBase.merge(
  z.object({
    tipo: z.literal("Matriz"),
    texto: z.string().min(1, "Titulo é obrigatório"),
    opcoes: z.array(optionSchema),
    colunas: z.array(optionSchema),
  })
);

const escalaLinearSchema = tipoBase.merge(
  z.object({
    tipo: z.literal("EscalaLinear"),
    texto: z.string().min(1, "Titulo é obrigatório"),
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
    tipo: z.literal("CaixaTexto"),
    texto: z.string().min(1, "Titulo é obrigatório"),
  })
);

const multiplaEscolhaSchema = tipoBase.merge(
  z.object({
    tipo: z.literal("MultiplaEscolha"),
    texto: z.string().min(1, "Titulo é obrigatório"),
    opcoes: z.array(optionSchema),
  })
);

const menuSuspensoSchema = tipoBase.merge(
  z.object({
    tipo: z.literal("MenuSuspenso"),
    texto: z.string().min(1, "Titulo é obrigatório"),
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

const schemaWithPreprocessing: ZodType<FormSchemaType> = z.preprocess((data: any) => {
  return {
    ...data,
    tipo: Array.isArray(data.tipo) ? data.tipo[0] : data.tipo,
  };
}, formSchema);

export type FormSchemaType = z.infer<typeof formSchema>;
export type MultipleChoiceSchemaType = z.infer<typeof multiplaEscolhaSchema>;
export type EscalaLinearSchema = z.infer<typeof escalaLinearSchema>;
export type MatrixSchemaType = z.infer<typeof matrixSchema>;
