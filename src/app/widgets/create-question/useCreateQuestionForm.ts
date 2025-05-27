import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const useCreateQuestionForm = () =>
  useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: {},
  });

export const optionSchema = z.object({
  idOpcao: z.string(),
  texto: z.string(),
  ordem: z.number(),
  peso: z.number(),
});

const matrixSchema = z.object({
  tipo: z.literal("Matriz"),
  texto: z.string().min(1, "Título é obrigatório"),
  opcoes: z.array(optionSchema).min(1, "Adicione pelo menos uma linha"),
  colunas: z.array(optionSchema).min(1, "Adicione pelo menos uma coluna"),
});

const escalaLinearSchema = z.object({
  tipo: z.literal("EscalaLinear"),
  texto: z.string().min(1, "Título é obrigatório"),
  ratingLabels: z
    .object({
      min: z.number().min(0).max(10),
      max: z.number().min(0).max(10),
      maxLabel: z.string().min(1),
      minLabel: z.string().min(1),
    })
    .refine((data) => data.min < data.max, {
      message: "O valor mínimo deve ser menor que o máximo",
      path: ["max"],
    }),
});

const caixaTextoSchema = z.object({
  tipo: z.literal("CaixaTexto"),
  texto: z.string().min(1, "Título é obrigatório"),
});

const multiplaEscolhaSchema = z.object({
  tipo: z.literal("MultiplaEscolha"),
  texto: z.string().min(1, "Título é obrigatório"),
  options: z.array(optionSchema).min(1, "Adicione pelo menos uma opção"),
});

const menuSuspensoSchema = z.object({
  tipo: z.literal("MenuSuspenso"),
  texto: z.string().min(1, "Título é obrigatório"),
});

const formSchema = z.discriminatedUnion("tipo", [
  matrixSchema,
  escalaLinearSchema,
  caixaTextoSchema,
  multiplaEscolhaSchema,
  menuSuspensoSchema,
]);

export type FormSchemaType = z.infer<typeof formSchema>;
