import { useForm } from "react-hook-form";

export const useExecutionAnswer = () =>
  useForm({
    mode: "onTouched",
    shouldFocusError: false,
  });

export interface RespostaItem {
  resposta?: string | (string | null)[];
}

export interface RespostaMap {
  [key: string]: RespostaItem;
}
