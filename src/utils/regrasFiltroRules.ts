// Regras de relacionamento entre Tipo de Disciplina, Tipo de Professor e Nível de Ensino
// Sistema flexível que permite múltiplas combinações

export interface RegraDisciplinaProfessor {
  id: string;
  tipoDisciplina: string;
  contextoAluno?: string; // "Presencial", "EaD", "Ambos"
  nivelEnsino?: string; // "Graduação", "Pós-graduação", "EAD"
  tiposProfessorPermitidos: string[];
  niveisEnsinoPermitidos: string[];
  descricao: string; // Descrição da regra para facilitar identificação
}

// Regras baseadas no exemplo fornecido: Nível Ensino -> Tipo Avaliado -> Tipo Turma -> Tipo Professor Turma
export const REGRAS_DISCIPLINA_PROFESSOR: RegraDisciplinaProfessor[] = [
  // ===== REGRAS BASEADAS NO EXEMPLO =====
  
  // REGRA 1: Presencial + Disciplina + Aulas à distância -> Tutor
  {
    id: 'presencial-disciplina-distancia-tutor',
    tipoDisciplina: 'Disciplina',
    contextoAluno: 'Presencial',
    nivelEnsino: 'Presencial',
    tiposProfessorPermitidos: ['Tutor'],
    niveisEnsinoPermitidos: ['Presencial'],
    descricao: 'Presencial + Disciplina + Aulas à distância -> Tutor'
  },

  // REGRA 2: Presencial + Disciplina + Aulas presenciais -> Titular
  {
    id: 'presencial-disciplina-presencial-titular',
    tipoDisciplina: 'Disciplina',
    contextoAluno: 'Presencial',
    nivelEnsino: 'Presencial',
    tiposProfessorPermitidos: ['Titular'],
    niveisEnsinoPermitidos: ['Presencial'],
    descricao: 'Presencial + Disciplina + Aulas presenciais -> Titular'
  },

  // REGRA 3: EAD + Disciplina + Aulas à distância -> Tutor
  {
    id: 'ead-disciplina-distancia-tutor',
    tipoDisciplina: 'Disciplina',
    contextoAluno: 'EaD',
    nivelEnsino: 'EAD',
    tiposProfessorPermitidos: ['Tutor'],
    niveisEnsinoPermitidos: ['EAD'],
    descricao: 'EAD + Disciplina + Aulas à distância -> Tutor'
  },

  // ===== REGRAS ESPECÍFICAS POR TIPO DE DISCIPLINA =====
  
  // PACEXT - Segue regras gerais
  {
    id: 'pacext-presencial-presencial-titular',
    tipoDisciplina: 'PACEXT',
    contextoAluno: 'Presencial',
    nivelEnsino: 'Presencial',
    tiposProfessorPermitidos: ['Titular'],
    niveisEnsinoPermitidos: ['Presencial'],
    descricao: 'PACEXT + Presencial + Aulas presenciais -> Titular'
  },
  {
    id: 'pacext-presencial-distancia-tutor',
    tipoDisciplina: 'PACEXT',
    contextoAluno: 'Presencial',
    nivelEnsino: 'Presencial',
    tiposProfessorPermitidos: ['Tutor'],
    niveisEnsinoPermitidos: ['Presencial'],
    descricao: 'PACEXT + Presencial + Aulas à distância -> Tutor'
  },
  {
    id: 'pacext-ead-distancia-tutor',
    tipoDisciplina: 'PACEXT',
    contextoAluno: 'EaD',
    nivelEnsino: 'EAD',
    tiposProfessorPermitidos: ['Tutor'],
    niveisEnsinoPermitidos: ['EAD'],
    descricao: 'PACEXT + EAD + Aulas à distância -> Tutor'
  },

  // ESTÁGIO - Segue regras gerais
  {
    id: 'estagio-presencial-presencial-titular',
    tipoDisciplina: 'Estágio',
    contextoAluno: 'Presencial',
    nivelEnsino: 'Presencial',
    tiposProfessorPermitidos: ['Titular'],
    niveisEnsinoPermitidos: ['Presencial'],
    descricao: 'Estágio + Presencial + Aulas presenciais -> Titular'
  },
  {
    id: 'estagio-presencial-distancia-tutor',
    tipoDisciplina: 'Estágio',
    contextoAluno: 'Presencial',
    nivelEnsino: 'Presencial',
    tiposProfessorPermitidos: ['Tutor'],
    niveisEnsinoPermitidos: ['Presencial'],
    descricao: 'Estágio + Presencial + Aulas à distância -> Tutor'
  },
  {
    id: 'estagio-ead-distancia-tutor',
    tipoDisciplina: 'Estágio',
    contextoAluno: 'EaD',
    nivelEnsino: 'EAD',
    tiposProfessorPermitidos: ['Tutor'],
    niveisEnsinoPermitidos: ['EAD'],
    descricao: 'Estágio + EAD + Aulas à distância -> Tutor'
  },

  // TCC - Pode ter Titular E Tutor
  {
    id: 'tcc-presencial-presencial-titular-tutor',
    tipoDisciplina: 'TCC',
    contextoAluno: 'Presencial',
    nivelEnsino: 'Presencial',
    tiposProfessorPermitidos: ['Titular', 'Tutor'],
    niveisEnsinoPermitidos: ['Presencial'],
    descricao: 'TCC + Presencial + Aulas presenciais -> Titular + Tutor'
  },
  {
    id: 'tcc-presencial-distancia-tutor',
    tipoDisciplina: 'TCC',
    contextoAluno: 'Presencial',
    nivelEnsino: 'Presencial',
    tiposProfessorPermitidos: ['Tutor'],
    niveisEnsinoPermitidos: ['Presencial'],
    descricao: 'TCC + Presencial + Aulas à distância -> Tutor'
  },
  {
    id: 'tcc-ead-distancia-tutor',
    tipoDisciplina: 'TCC',
    contextoAluno: 'EaD',
    nivelEnsino: 'EAD',
    tiposProfessorPermitidos: ['Tutor'],
    niveisEnsinoPermitidos: ['EAD'],
    descricao: 'TCC + EAD + Aulas à distância -> Tutor'
  },

  // NORMAL - Pode ter Titular E Tutor
  {
    id: 'normal-presencial-presencial-titular-tutor',
    tipoDisciplina: 'Normal',
    contextoAluno: 'Presencial',
    nivelEnsino: 'Presencial',
    tiposProfessorPermitidos: ['Titular', 'Tutor'],
    niveisEnsinoPermitidos: ['Presencial'],
    descricao: 'Normal + Presencial + Aulas presenciais -> Titular + Tutor'
  },
  {
    id: 'normal-presencial-distancia-tutor',
    tipoDisciplina: 'Normal',
    contextoAluno: 'Presencial',
    nivelEnsino: 'Presencial',
    tiposProfessorPermitidos: ['Tutor'],
    niveisEnsinoPermitidos: ['Presencial'],
    descricao: 'Normal + Presencial + Aulas à distância -> Tutor'
  },
  {
    id: 'normal-ead-distancia-tutor',
    tipoDisciplina: 'Normal',
    contextoAluno: 'EaD',
    nivelEnsino: 'EAD',
    tiposProfessorPermitidos: ['Tutor'],
    niveisEnsinoPermitidos: ['EAD'],
    descricao: 'Normal + EAD + Aulas à distância -> Tutor'
  },

  // PRÁTICA JURÍDICA - Segue regras gerais
  {
    id: 'pratica-presencial-presencial-titular',
    tipoDisciplina: 'Prática Jurídica',
    contextoAluno: 'Presencial',
    nivelEnsino: 'Presencial',
    tiposProfessorPermitidos: ['Titular'],
    niveisEnsinoPermitidos: ['Presencial'],
    descricao: 'Prática Jurídica + Presencial + Aulas presenciais -> Titular'
  },
  {
    id: 'pratica-presencial-distancia-tutor',
    tipoDisciplina: 'Prática Jurídica',
    contextoAluno: 'Presencial',
    nivelEnsino: 'Presencial',
    tiposProfessorPermitidos: ['Tutor'],
    niveisEnsinoPermitidos: ['Presencial'],
    descricao: 'Prática Jurídica + Presencial + Aulas à distância -> Tutor'
  },
  {
    id: 'pratica-ead-distancia-tutor',
    tipoDisciplina: 'Prática Jurídica',
    contextoAluno: 'EaD',
    nivelEnsino: 'EAD',
    tiposProfessorPermitidos: ['Tutor'],
    niveisEnsinoPermitidos: ['EAD'],
    descricao: 'Prática Jurídica + EAD + Aulas à distância -> Tutor'
  }
];

// Função para obter tipos de professor permitidos baseado no contexto completo
export const obterTiposProfessorPorContexto = (
  tiposDisciplina: string[], 
  contextoAluno?: string, 
  nivelEnsino?: string
): string[] => {
  const tiposProfessor = new Set<string>();
  
  tiposDisciplina.forEach(tipoDisciplina => {
    // Buscar regras que correspondem ao contexto
    const regrasAplicaveis = REGRAS_DISCIPLINA_PROFESSOR.filter(regra => {
      const disciplinaMatch = regra.tipoDisciplina === tipoDisciplina;
      const contextoMatch = !regra.contextoAluno || regra.contextoAluno === contextoAluno || regra.contextoAluno === 'Ambos';
      const nivelMatch = !regra.nivelEnsino || regra.nivelEnsino === nivelEnsino;
      
      return disciplinaMatch && contextoMatch && nivelMatch;
    });
    
    // Se não encontrar regras específicas, buscar regras genéricas
    if (regrasAplicaveis.length === 0) {
      const regrasGenericas = REGRAS_DISCIPLINA_PROFESSOR.filter(regra => 
        regra.tipoDisciplina === tipoDisciplina && 
        (!regra.contextoAluno || regra.contextoAluno === 'Ambos')
      );
      regrasGenericas.forEach(regra => {
        regra.tiposProfessorPermitidos.forEach(tipo => tiposProfessor.add(tipo));
      });
    } else {
      regrasAplicaveis.forEach(regra => {
        regra.tiposProfessorPermitidos.forEach(tipo => tiposProfessor.add(tipo));
      });
    }
  });
  
  return Array.from(tiposProfessor);
};

// Função para obter níveis de ensino permitidos baseado no contexto completo
export const obterNiveisEnsinoPorContexto = (
  tiposDisciplina: string[], 
  contextoAluno?: string, 
  nivelEnsino?: string
): string[] => {
  const niveisEnsino = new Set<string>();
  
  tiposDisciplina.forEach(tipoDisciplina => {
    // Buscar regras que correspondem ao contexto
    const regrasAplicaveis = REGRAS_DISCIPLINA_PROFESSOR.filter(regra => {
      const disciplinaMatch = regra.tipoDisciplina === tipoDisciplina;
      const contextoMatch = !regra.contextoAluno || regra.contextoAluno === contextoAluno || regra.contextoAluno === 'Ambos';
      const nivelMatch = !regra.nivelEnsino || regra.nivelEnsino === nivelEnsino;
      
      return disciplinaMatch && contextoMatch && nivelMatch;
    });
    
    // Se não encontrar regras específicas, buscar regras genéricas
    if (regrasAplicaveis.length === 0) {
      const regrasGenericas = REGRAS_DISCIPLINA_PROFESSOR.filter(regra => 
        regra.tipoDisciplina === tipoDisciplina && 
        (!regra.contextoAluno || regra.contextoAluno === 'Ambos')
      );
      regrasGenericas.forEach(regra => {
        regra.niveisEnsinoPermitidos.forEach(nivel => niveisEnsino.add(nivel));
      });
    } else {
      regrasAplicaveis.forEach(regra => {
        regra.niveisEnsinoPermitidos.forEach(nivel => niveisEnsino.add(nivel));
      });
    }
  });
  
  return Array.from(niveisEnsino);
};

// Funções de compatibilidade (mantidas para não quebrar código existente)
export const obterTiposProfessorPorDisciplina = (tiposDisciplina: string[]): string[] => {
  return obterTiposProfessorPorContexto(tiposDisciplina);
};

export const obterNiveisEnsinoPorDisciplina = (tiposDisciplina: string[]): string[] => {
  return obterNiveisEnsinoPorContexto(tiposDisciplina);
};

// Função para validar se uma combinação é válida
export const validarCombinacaoDisciplinaProfessor = (
  tipoDisciplina: string, 
  tipoProfessor: string
): boolean => {
  const regra = REGRAS_DISCIPLINA_PROFESSOR.find(r => r.tipoDisciplina === tipoDisciplina);
  return regra ? regra.tiposProfessorPermitidos.includes(tipoProfessor) : false;
};

// Função para obter regras aplicáveis baseado no contexto do aluno
export const obterRegrasPorContextoAluno = (contextoAluno: string): RegraDisciplinaProfessor[] => {
  // Regras específicas por contexto (pode ser expandido)
  switch (contextoAluno) {
    case 'Presencial':
      return REGRAS_DISCIPLINA_PROFESSOR.filter(regra => 
        regra.niveisEnsinoPermitidos.includes('Graduação') || 
        regra.niveisEnsinoPermitidos.includes('Pós-graduação')
      );
    case 'EaD':
      return REGRAS_DISCIPLINA_PROFESSOR.filter(regra => 
        regra.niveisEnsinoPermitidos.includes('EAD')
      );
    default:
      return REGRAS_DISCIPLINA_PROFESSOR;
  }
};
