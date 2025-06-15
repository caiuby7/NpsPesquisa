import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const useCreateForm = () =>
  useForm<CreateFormSchema>({
    resolver: zodResolver(createFormSchema),
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: {},
  });



const createFormSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório" ),
  descricao: z.string().min(1, "Descrição é obrigatório"),
  dataInicio: z.string().min(1, "Data de início é obrigatório"),
  dataFim: z.string().min(1, "Data de fim é obrigatório"),
  ordemAleatoria: z.boolean().optional(),
  questoes: z.array(z.number()).optional(),
  textoBoasVindas: z.string().optional(),
  templateEmailConvite: z.string().optional(),
  templateEmailLembrete: z.string().optional(),
  lembrarACadaXDias: z.number().optional(),
  enviarLembreteAutomatico: z.boolean().optional(),
  enviarLembreteParaTodos: z.boolean().optional(),
});

export type CreateFormSchema = z.infer<typeof createFormSchema>;
