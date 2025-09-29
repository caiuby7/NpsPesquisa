import React from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../../../../components/layout/main-layout.component';
import EditarAvaliacaoComponent from '../../../../app/pages/avaliacoes/editar-avaliacao.component';

export default function EditarAvaliacaoPage() {
  const { id } = useParams();

  return (
    <MainLayout>
      <EditarAvaliacaoComponent id={id as string} />
    </MainLayout>
  );
}
