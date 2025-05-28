import { z } from "zod";

export const firstStepFormSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  dataExpiracao: z
    .string()
    .min(1, "A data é obrigatória")
    .refine((val) => new Date(val) > new Date(), {
      message: "A data deve ser no futuro",
    }),
});

export type FirstStepFormValues = z.infer<typeof firstStepFormSchema>;
