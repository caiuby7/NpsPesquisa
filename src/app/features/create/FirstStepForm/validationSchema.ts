import { z } from "zod";

export const firstStepFormSchema = z.object({
  titulo: z.string().min(1, "Titulo é obrigatório").optional(),
  descricao: z.string().min(1, "Descricao é obrigatório").optional(),
  dataInicio: z.string().min(1, "Data de início é obrigatória").optional(),
  dataFim: z.string().min(1, "Data de fim é obrigatória").optional(),
  ordemAleatoria: z.boolean().optional(),
  textoBoasVindas: z.string().optional(),
  templateEmailConvite: z.string().optional(),
  templateEmailLembrete: z.string().optional(),
  lembrarACadaXDias: z.coerce.number().optional(),
  enviarLembreteAutomatico: z.boolean().optional(),
  enviarLembreteParaTodos: z.boolean().optional(),
});

export type FirstStepFormValues = z.infer<typeof firstStepFormSchema>;
