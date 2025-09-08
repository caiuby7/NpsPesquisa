import React from 'react';
import { AvaliacaoInstitucionalComponent } from '../../features/avaliacao-institucional';

export default function AvaliacaoInstitucionalPage() {
  // Em produção, isso viria da URL ou de um contexto de autenticação
  const questionarioId = '123';

  return <AvaliacaoInstitucionalComponent questionarioId={questionarioId} />;
}
