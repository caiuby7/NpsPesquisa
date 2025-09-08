import { z } from "zod";
import { TipoQuestionarioEnum, TipoItemAvaliadoEnum } from "../../../services/form/form.services.types";

export const firstStepFormSchema = z.object({
  titulo: z.string().min(1, "Titulo é obrigatório"),
  descricao: z.string().min(1, "Descricao é obrigatória"),
  dataInicio: z.string().min(1, "Data de início é obrigatória"),
  dataFim: z.string().min(1, "Data de fim é obrigatória"),
  tipo: z.nativeEnum(TipoQuestionarioEnum, {
    errorMap: () => ({ message: "Tipo de questionário é obrigatório" })
  }),
  permitirComentarios: z.boolean().default(false),
  permitirSalvarAndamento: z.boolean().default(false),
  tipoItemAvaliado: z.nativeEnum(TipoItemAvaliadoEnum).optional(),
  nomeItemEspecifico: z.string().optional(),
  textoBoasVindas: z.string().optional(),
  templateEmailConvite: z.string().optional(),
  templateEmailLembrete: z.string().optional(),
  lembrarACadaXDias: z.coerce.number().optional(),
  enviarLembreteAutomatico: z.boolean().default(false),
  enviarLembreteParaTodos: z.boolean().default(false),
});

export type FirstStepFormValues = z.infer<typeof firstStepFormSchema>;
