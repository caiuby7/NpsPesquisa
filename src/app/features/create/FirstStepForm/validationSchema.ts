import { z } from "zod";

export const firstStepFormSchema = z.object({
  titulo: z.string().min(1, "Titulo é obrigatório"),
  descricao: z.string().min(1, "Descricao é obrigatório"),
  dataInicio: z.string().min(1, "Data de início é obrigatória"),
  dataFim: z.string().min(1, "Data de fim é obrigatória"),
  ordemAleatoria: z.boolean().optional(),
  textoBoasVindas: z.string().min(1, "Texto de boas-vindas é obrigatório"),
  templateEmailConvite: z.string().min(1, "Template de convite é obrigatório"),
  templateEmailLembrete: z.string().min(1, "Template de lembrete é obrigatório"),
  lembrarACadaXDias: z.coerce.number().min(1, "Informe o intervalo de dias para lembrete"),
  enviarLembreteAutomatico: z.boolean().optional(),
  enviarLembreteParaTodos: z.boolean().optional(),
});

export type FirstStepFormValues = z.infer<typeof firstStepFormSchema>;
