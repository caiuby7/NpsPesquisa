import React from 'react';
import TabelasAgrupadas from './tabelas-agrupadas';
import { relatoriosAvaliacaoService } from '../../../services/relatorios-avaliacao.service';

const TabelasPorDisciplina: React.FC = () => {
  return (
    <TabelasAgrupadas
      titulo="Relatório por Disciplina — Visão Tabular"
      descricao="Visualize os resultados agrupados por disciplina em formato tabular detalhado."
      obterRelatorio={relatoriosAvaliacaoService.obterRelatorioPorDisciplina}
      tipoAgrupamento="por-disciplina"
    />
  );
};

export default TabelasPorDisciplina;

