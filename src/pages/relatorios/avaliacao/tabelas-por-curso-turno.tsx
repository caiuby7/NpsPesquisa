import React from 'react';
import TabelasAgrupadas from './tabelas-agrupadas';
import { relatoriosAvaliacaoService } from '../../../services/relatorios-avaliacao.service';

const TabelasPorCursoTurno: React.FC = () => {
  return (
    <TabelasAgrupadas
      titulo="Relatório por Curso-Turno — Visão Tabular"
      descricao="Visualize os resultados agrupados por curso e turno em formato tabular detalhado."
      obterRelatorio={relatoriosAvaliacaoService.obterRelatorioPorCursoTurno}
      tipoAgrupamento="por-curso-turno"
    />
  );
};

export default TabelasPorCursoTurno;

