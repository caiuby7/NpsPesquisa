import { z } from "zod";

export const firstStepFormSchema = z.object({
  titulo: z.string().min(1, "Titulo é obrigatório"),
  descricao: z.string().min(1, "Descricao é obrigatório"),
  dataInicio: z.string().min(1, "Data de início é obrigatória"),
  dataFim: z.string().min(1, "Data de fim é obrigatória"),
  ordemAleatoria: z.boolean().optional(),
});

export type FirstStepFormValues = z.infer<typeof firstStepFormSchema>;
