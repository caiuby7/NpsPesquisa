import React from 'react';
import TabelasAgrupadas from './tabelas-agrupadas';
import { relatoriosAvaliacaoService } from '../../../services/relatorios-avaliacao.service';

const TabelasPorTurma: React.FC = () => {
  return (
    <TabelasAgrupadas
      titulo="Relatório por Turma — Visão Tabular"
      descricao="Visualize os resultados agrupados por turma em formato tabular detalhado."
      obterRelatorio={relatoriosAvaliacaoService.obterRelatorioPorTurma}
      tipoAgrupamento="por-turma"
    />
  );
};

export default TabelasPorTurma;

