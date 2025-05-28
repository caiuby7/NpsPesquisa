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
  dataExpiracao: z.string().min(1, "Data de expiração é obrigatório"),
  questoes: z.array(z.number()).min(1, "Adicione pelo menos uma questão"),
});

export type CreateFormSchema = z.infer<typeof createFormSchema>;
