import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TipoQuestionarioEnum, TipoItemAvaliadoEnum } from "../../services/form/form.services.types";

export const useCreateForm = () =>
  useForm<CreateFormSchema>({
    resolver: zodResolver(createFormSchema),
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: {
      tipo: TipoQuestionarioEnum.NPS,
      permitirComentarios: false,
      permitirSalvarAndamento: false,
      enviarLembreteAutomatico: false,
      enviarLembreteParaTodos: false,
    },
  });

const createFormSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  dataInicio: z.string().min(1, "Data de início é obrigatória"),
  dataFim: z.string().min(1, "Data de fim é obrigatória"),
  tipo: z.nativeEnum(TipoQuestionarioEnum, {
    errorMap: () => ({ message: "Tipo de questionário é obrigatório" })
  }),
  permitirComentarios: z.boolean(),
  permitirSalvarAndamento: z.boolean(),
  tipoItemAvaliado: z.nativeEnum(TipoItemAvaliadoEnum).optional(),
  nomeItemEspecifico: z.string().optional(),
  questoes: z.array(z.number()).optional(),
  textoBoasVindas: z.string().optional(),
  templateEmailConvite: z.string().optional(),
  templateEmailLembrete: z.string().optional(),
  lembrarACadaXDias: z.number().optional(),
  enviarLembreteAutomatico: z.boolean(),
  enviarLembreteParaTodos: z.boolean(),
});

export type CreateFormSchema = z.infer<typeof createFormSchema>;
