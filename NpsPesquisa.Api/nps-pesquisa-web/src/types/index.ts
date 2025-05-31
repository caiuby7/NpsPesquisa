export interface Usuario {
    id: number;
    nome: string;
    email: string;
    perfilId: number;
    perfil: Perfil;
}

export interface Perfil {
    id: number;
    nome: string;
    descricao: string;
}

export interface Questionario {
    id: number;
    titulo: string;
    descricao: string;
    dataCriacao: string;
    questoes: QuestaoQuestionario[];
}

export interface Questao {
    id: number;
    texto: string;
    tipo: string;
    opcoes: OpcaoQuestao[];
}

export interface QuestaoQuestionario {
    id: number;
    questionarioId: number;
    questaoId: number;
    questao: Questao;
    ordem: number;
}

export interface OpcaoQuestao {
    id: number;
    questaoId: number;
    texto: string;
    valor: number;
}

export interface Aluno {
    id: number;
    nome: string;
    email: string;
    cursoId: number;
    curso: Curso;
}

export interface Curso {
    id: number;
    nome: string;
    descricao: string;
}

export interface Resposta {
    id: number;
    questionarioId: number;
    alunoId: number;
    dataResposta: string;
    respostasQuestoes: RespostaQuestao[];
}

export interface RespostaQuestao {
    id: number;
    respostaId: number;
    questaoId: number;
    opcaoId?: number;
    texto?: string;
}

export interface ConviteQuestionario {
    id: number;
    questionarioId: number;
    alunoId: number;
    chave: string;
    dataEnvio: string;
    dataResposta?: string;
    respondido: boolean;
} 