import { useMutation } from '@tanstack/react-query';
import { relatoriosAvaliacaoService, RelatorioAvaliacaoRequest, RelatorioAvaliacaoGeralDto } from '../services/relatorios-avaliacao.service';

export const useRelatorioAvaliacaoGeral = () =>
  useMutation<RelatorioAvaliacaoGeralDto, Error, RelatorioAvaliacaoRequest>({
    mutationFn: (payload) => relatoriosAvaliacaoService.obterRelatorioGeral(payload),
  });


