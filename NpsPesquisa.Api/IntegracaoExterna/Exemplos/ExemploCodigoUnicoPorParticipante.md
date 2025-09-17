# 🎯 Exemplo: Código Único por Participante com Múltiplas Disciplinas

## ✅ **Solução Correta Implementada**

### **Cenário: João Silva faz Matemática e Português**

#### **1. Tabela `ConviteQuestionario` (1 linha)**
| Id | QuestionarioId | ParticipanteId | Chave | DataEnvio | Respondido |
|----|----------------|----------------|-------|-----------|------------|
| 1  | 123            | 1              | ABC123| 2024-01-15| false      |

#### **2. Tabela `ParticipanteQuestionario` (2 linhas)**
| Id | QuestionarioId | ParticipanteId | DisciplinaId | DisciplinaNome | Status | ContextoDescricao |
|----|----------------|----------------|--------------|----------------|--------|-------------------|
| 1  | 123            | 1              | 7            | Matemática     | Pendente | "Curso: Engenharia \| Turma: ENG-2024-1 \| Disciplina: Matemática" |
| 2  | 123            | 1              | 8            | Português      | Pendente | "Curso: Engenharia \| Turma: ENG-2024-1 \| Disciplina: Português" |

## 📧 **Email Enviado**

```
Assunto: Avaliação de Disciplinas - Matemática e Português
Para: joao@email.com

Olá João Silva!

Você foi convidado para responder ao questionário: "Avaliação de Disciplinas - Matemática e Português"

Disciplinas para avaliar:
- Matemática Básica (Turma ENG-2024-1)
- Português Técnico (Turma ENG-2024-1)

Clique no link abaixo para acessar o questionário:
https://sistema.com/questionario/ABC123

Este link é único e pessoal.
```

## 🔍 **Ao Acessar o Link ABC123**

### **Request:**
```http
GET /api/convitequestionario/validar/ABC123
```

### **Response:**
```json
{
  "id": 1,
  "participanteId": 1,
  "participante": "João Silva",
  "tipoParticipante": "Aluno",
  "questionarioId": 123,
  "questionario": "Avaliação de Disciplinas - Matemática e Português",
  "respondido": false,
  "contextosAvaliacao": [
    {
      "id": 1,
      "tipoItemAvaliado": "Disciplina",
      "nomeItemEspecifico": "Matemática Básica",
      "disciplinaId": 7,
      "disciplinaNome": "Matemática",
      "cursoId": 10,
      "cursoNome": "Engenharia",
      "turmaId": 25,
      "turmaNome": "ENG-2024-1",
      "status": "Pendente",
      "dataResposta": null,
      "contextoDescricao": "Curso: Engenharia | Turma: ENG-2024-1 | Disciplina: Matemática"
    },
    {
      "id": 2,
      "tipoItemAvaliado": "Disciplina",
      "nomeItemEspecifico": "Português Técnico",
      "disciplinaId": 8,
      "disciplinaNome": "Português",
      "cursoId": 10,
      "cursoNome": "Engenharia",
      "turmaId": 25,
      "turmaNome": "ENG-2024-1",
      "status": "Pendente",
      "dataResposta": null,
      "contextoDescricao": "Curso: Engenharia | Turma: ENG-2024-1 | Disciplina: Português"
    }
  ],
  "totalItensAvaliar": 2,
  "itensRespondidos": 0,
  "itensPendentes": 2
}
```

## 🎨 **Interface do Usuário**

### **Tela de Avaliação Unificada**
```
┌─────────────────────────────────────────────────────────────┐
│ Avaliação de Disciplinas - Matemática e Português          │
│ Participante: João Silva                                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 📚 Disciplinas para Avaliar (2 itens)                      │
├─────────────────────────────────────────────────────────────┤
│ ✅ Matemática Básica                                        │
│    Curso: Engenharia | Turma: ENG-2024-1                   │
│    Status: Pendente                                         │
│    [Avaliar]                                                │
├─────────────────────────────────────────────────────────────┤
│ ✅ Português Técnico                                        │
│    Curso: Engenharia | Turma: ENG-2024-1                   │
│    Status: Pendente                                         │
│    [Avaliar]                                                │
└─────────────────────────────────────────────────────────────┘

Progresso: 0/2 disciplinas respondidas
```

## 🔄 **Fluxo de Resposta**

### **1. Usuário clica em "Avaliar Matemática"**
- Sistema carrega questões específicas para Matemática
- Contexto: `disciplinaId=7, turmaId=25, cursoId=10`
- Salva resposta com contexto específico

### **2. Usuário clica em "Avaliar Português"**
- Sistema carrega questões específicas para Português
- Contexto: `disciplinaId=8, turmaId=25, cursoId=10`
- Salva resposta com contexto específico

### **3. Após responder ambas**
- Status atualizado para "Respondido"
- Progresso: 2/2 disciplinas respondidas
- Convite marcado como concluído

## 📊 **Tabela de Respostas**

| Id | QuestionarioId | ParticipanteId | DisciplinaId | CodigoConvite | DataResposta | Status |
|----|----------------|----------------|--------------|---------------|--------------|---------|
| 1  | 123            | 1              | 7            | ABC123        | 2024-01-15   | Respondido |
| 2  | 123            | 1              | 8            | ABC123        | 2024-01-15   | Respondido |

## ✅ **Vantagens da Solução**

### **1. Código Único**
- ✅ 1 código por participante/questionário
- ✅ Fácil de gerenciar e rastrear
- ✅ Não há confusão com múltiplos códigos

### **2. Interface Unificada**
- ✅ Todas as disciplinas em uma tela
- ✅ Progresso claro e visual
- ✅ Experiência do usuário melhorada

### **3. Contexto Específico**
- ✅ Cada disciplina mantém seu contexto
- ✅ Respostas precisas e organizadas
- ✅ Rastreabilidade completa

### **4. Flexibilidade**
- ✅ Participante pode responder parcialmente
- ✅ Status independente para cada disciplina
- ✅ Fácil de gerenciar

## 🚀 **Resumo da Solução**

**Código único por participante + Múltiplas disciplinas unificadas**

- **1 código**: ABC123 (por participante/questionário)
- **2 contextos**: Matemática e Português (na mesma tela)
- **Interface unificada**: Todas as disciplinas em uma tela
- **Contexto específico**: Cada disciplina mantém seu contexto
- **Experiência melhorada**: Usuário vê tudo de uma vez

**Solução perfeita para múltiplas disciplinas!** 🎯✨
