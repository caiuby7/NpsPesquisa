import React from 'react';
import TabelasAgrupadas from './tabelas-agrupadas';
import { relatoriosAvaliacaoService } from '../../../services/relatorios-avaliacao.service';

const TabelasPorCurso: React.FC = () => {
  return (
    <TabelasAgrupadas
      titulo="Relatório por Curso — Visão Tabular"
      descricao="Visualize os resultados agrupados por curso em formato tabular detalhado."
      obterRelatorio={relatoriosAvaliacaoService.obterRelatorioPorCurso}
      tipoAgrupamento="por-curso"
    />
  );
};

export default TabelasPorCurso;

