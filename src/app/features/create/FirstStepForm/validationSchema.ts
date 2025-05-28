import { z } from "zod";

export const firstStepFormSchema = z.object({
  titulo: z.string().min(1, "Titulo é obrigatório"),
  descricao: z.string().min(1, "Descricao é obrigatório"),
  dataExpiracao: z
    .string()
    .min(1, "A data é obrigatória")
    .refine((val) => new Date(val) > new Date(), {
      message: "A data deve ser no futuro",
    }),
});

export type FirstStepFormValues = z.infer<typeof firstStepFormSchema>;
