# 📚 Exemplo de Uso: Contexto de Participantes em Questionários

## 🎯 Problema Resolvido

Antes desta implementação, quando criávamos uma avaliação por disciplina específica (ex: Matemática), o sistema:
- ✅ Filtrava corretamente os participantes na hora de buscar
- ❌ **NÃO salvava o contexto** de disciplina no `ParticipanteQuestionario`
- ❌ **Ao carregar depois**, trazia todos os participantes do questionário, independente da disciplina

## 🔧 Solução Implementada

Agora o sistema salva o **contexto completo** usado para adicionar cada participante, permitindo:
- **Filtrar participantes** por contexto específico
- **Manter histórico** de como cada participante foi adicionado
- **Evitar misturar** participantes de diferentes disciplinas

## 📋 Novos Endpoints

### 1. Adicionar Participante com Contexto
```http
POST /api/participantequestionario/adicionar-com-contexto
```

**Exemplo de Request:**
```json
{
  "questionarioId": 123,
  "participanteIds": [1, 2, 3, 4, 5],
  "cursoId": 10,
  "turmaId": 25,
  "disciplinaId": 7,
  "professorId": 15,
  "instituicaoId": 1,
  "periodoLetivoId": 3,
  "tipoItemAvaliado": 2,
  "nomeItemEspecifico": "Matemática Básica",
  "itemAvaliadoId": 7
}
```

**Exemplo de Response:**
```json
{
  "sucesso": true,
  "participantesAdicionados": 5,
  "participantesJaExistentes": 0,
  "erros": 0,
  "detalhes": {
    "adicionados": [
      {
        "participanteId": 1,
        "nome": "João Silva",
        "email": "joao@email.com",
        "tipo": 0,
        "contexto": "Curso: Engenharia | Turma: ENG-2024-1 | Disciplina: Matemática Básica | Professor: Maria Santos | Instituição: Católica SC | Período: 2024/1"
      }
    ],
    "jaExistentes": [],
    "erros": []
  }
}
```

### 2. Listar Participantes com Contexto
```http
GET /api/participantequestionario/questionario/{id}
```

**Exemplo de Response:**
```json
[
  {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@email.com",
    "tipo": 0,
    "ativo": true,
    "dataConvite": "2024-01-15T10:30:00Z",
    "dataResposta": null,
    "status": "Pendente",
    "matricula": "2024001",
    "curso": "Engenharia",
    "contexto": {
      "cursoId": 10,
      "cursoNome": "Engenharia",
      "turmaId": 25,
      "turmaNome": "ENG-2024-1",
      "disciplinaId": 7,
      "disciplinaNome": "Matemática Básica",
      "professorId": 15,
      "professorNome": "Maria Santos",
      "instituicaoId": 1,
      "instituicaoNome": "Católica SC",
      "periodoLetivoId": 3,
      "periodoLetivoNome": "2024/1",
      "tipoItemAvaliado": 2,
      "nomeItemEspecifico": "Matemática Básica",
      "itemAvaliadoId": 7,
      "contextoDescricao": "Curso: Engenharia | Turma: ENG-2024-1 | Disciplina: Matemática Básica | Professor: Maria Santos | Instituição: Católica SC | Período: 2024/1"
    }
  }
]
```

### 3. Filtrar Participantes por Contexto
```http
GET /api/participantequestionario/questionario/{id}/por-contexto?disciplinaId=7&cursoId=10
```

**Exemplo de Response:**
```json
{
  "questionarioId": 123,
  "filtrosAplicados": {
    "cursoId": 10,
    "turmaId": null,
    "disciplinaId": 7,
    "professorId": null,
    "instituicaoId": null,
    "periodoLetivoId": null,
    "tipoItemAvaliado": null
  },
  "totalParticipantes": 25,
  "participantesPorContexto": [
    {
      "contexto": {
        "cursoNome": "Engenharia",
        "turmaNome": "ENG-2024-1",
        "disciplinaNome": "Matemática Básica",
        "professorNome": "Maria Santos",
        "instituicaoNome": "Católica SC",
        "periodoLetivoNome": "2024/1",
        "tipoItemAvaliado": 2,
        "nomeItemEspecifico": "Matemática Básica"
      },
      "quantidade": 25,
      "participantes": [...]
    }
  ],
  "todosParticipantes": [...]
}
```

## 🎯 Cenários de Uso

### Cenário 1: Avaliação de Disciplina Específica
```javascript
// 1. Criar questionário para Matemática
const questionario = {
  titulo: "Avaliação de Matemática Básica",
  tipo: "AvaliacaoInstitucional",
  tipoItemAvaliado: "Disciplina",
  nomeItemEspecifico: "Matemática Básica"
};

// 2. Adicionar participantes com contexto de disciplina
const participantes = {
  questionarioId: 123,
  participanteIds: [1, 2, 3, 4, 5],
  disciplinaId: 7, // Matemática Básica
  cursoId: 10,     // Engenharia
  turmaId: 25,     // ENG-2024-1
  professorId: 15, // Maria Santos
  tipoItemAvaliado: "Disciplina",
  nomeItemEspecifico: "Matemática Básica"
};

// 3. Ao carregar depois, filtrar apenas participantes desta disciplina
const participantesMatematica = await fetch(
  `/api/participantequestionario/questionario/123/por-contexto?disciplinaId=7`
);
```

### Cenário 2: Avaliação de Turma Específica
```javascript
// 1. Criar questionário para turma específica
const questionario = {
  titulo: "Avaliação da Turma ENG-2024-1",
  tipo: "AvaliacaoInstitucional",
  tipoItemAvaliado: "Turma",
  nomeItemEspecifico: "ENG-2024-1"
};

// 2. Adicionar participantes com contexto de turma
const participantes = {
  questionarioId: 124,
  participanteIds: [1, 2, 3, 4, 5],
  turmaId: 25,     // ENG-2024-1
  cursoId: 10,     // Engenharia
  tipoItemAvaliado: "Turma",
  nomeItemEspecifico: "ENG-2024-1"
};

// 3. Ao carregar depois, filtrar apenas participantes desta turma
const participantesTurma = await fetch(
  `/api/participantequestionario/questionario/124/por-contexto?turmaId=25`
);
```

### Cenário 3: Avaliação de Professor Específico
```javascript
// 1. Criar questionário para professor específico
const questionario = {
  titulo: "Avaliação do Professor Maria Santos",
  tipo: "AvaliacaoInstitucional",
  tipoItemAvaliado: "Professor",
  nomeItemEspecifico: "Maria Santos"
};

// 2. Adicionar participantes com contexto de professor
const participantes = {
  questionarioId: 125,
  participanteIds: [1, 2, 3, 4, 5],
  professorId: 15, // Maria Santos
  disciplinaId: 7, // Matemática Básica
  tipoItemAvaliado: "Professor",
  nomeItemEspecifico: "Maria Santos"
};

// 3. Ao carregar depois, filtrar apenas participantes deste professor
const participantesProfessor = await fetch(
  `/api/participantequestionario/questionario/125/por-contexto?professorId=15`
);
```

## 🔍 Vantagens da Solução

### ✅ **Precisão**
- Cada participante é associado ao contexto específico usado para adicioná-lo
- Não há mistura de participantes de diferentes disciplinas/turmas

### ✅ **Rastreabilidade**
- Histórico completo de como cada participante foi adicionado
- Possibilidade de auditar os critérios usados

### ✅ **Flexibilidade**
- Filtros por qualquer combinação de contexto
- Suporte a múltiplos tipos de avaliação

### ✅ **Performance**
- Índices otimizados para consultas por contexto
- Consultas mais rápidas e eficientes

### ✅ **Compatibilidade**
- Mantém compatibilidade com código existente
- Campos opcionais não quebram funcionalidades atuais

## 🚀 Próximos Passos

1. **Executar migração** do banco de dados
2. **Atualizar frontend** para usar os novos endpoints
3. **Testar cenários** de avaliação por disciplina
4. **Documentar** para outros desenvolvedores
5. **Monitorar performance** das consultas

## 📝 Notas Importantes

- **Campos opcionais**: Todos os campos de contexto são opcionais
- **Backward compatibility**: Código existente continua funcionando
- **Performance**: Índices adicionados para otimizar consultas
- **Validação**: Sistema valida se os IDs de contexto existem
- **Auditoria**: Cada participante mantém seu contexto de origem
