import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";


export const useExecutionAnswer = () =>
  useForm<AnswersFormType>({
    resolver: zodResolver(answersSchema),
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: [],
  });
  
// Base para todas as respostas
const baseAnswerSchema = z.object({
  questionId: z.string(),
});

// Caixa de Texto: resposta textual simples
const caixaTextoAnswerSchema = baseAnswerSchema.extend({
  tipo: z.literal("CaixaTexto"),
  resposta: z.string().min(1, "A resposta não pode estar vazia"),
});

// Múltipla Escolha: array de IDs (checkbox)
const multiplaEscolhaAnswerSchema = baseAnswerSchema.extend({
  tipo: z.literal("MultiplaEscolha"),
  resposta: z.array(z.string()).min(1, "Selecione ao menos uma opção"), // idOpcao[]
});

// Menu Suspenso: uma única opção selecionada
const menuSuspensoAnswerSchema = baseAnswerSchema.extend({
  tipo: z.literal("MenuSuspenso"),
  resposta: z.string().min(1, "Selecione uma opção"), // idOpcao
});

// Matriz: para cada linha (idLinha), uma resposta de idColuna
const matrizAnswerSchema = baseAnswerSchema.extend({
  tipo: z.literal("Matriz"),
  resposta: z.array(
    z.object({
      idLinha: z.string(),
      idColuna: z.string(), // checkbox único por linha
    })
  ).min(1, "Responda ao menos uma linha"),
});

// Escala Linear: número entre min e max
const escalaLinearAnswerSchema = baseAnswerSchema.extend({
  tipo: z.literal("EscalaLinear"),
  resposta: z.number(), // inteiro dentro do range
});

// Union final de respostas possíveis
export const answerSchema = z.discriminatedUnion("tipo", [
  caixaTextoAnswerSchema,
  multiplaEscolhaAnswerSchema,
  menuSuspensoAnswerSchema,
  matrizAnswerSchema,
  escalaLinearAnswerSchema,
]);

// Um array de respostas de múltiplas questões
export const answersSchema = z.array(answerSchema);

export type AnswerType = z.infer<typeof answerSchema>;
export type AnswersFormType = z.infer<typeof answersSchema>;
export type MultiplaEscolhaAnswerSchema = z.infer<typeof multiplaEscolhaAnswerSchema>;
