# Como Vai Funcionar a Integração TOTVS

## 🔄 **Fluxo Completo da Integração**

### **1. 🕐 Sincronização Automática (Background Service)**

```
┌─────────────────────────────────────────────────────────────┐
│                    A CADA 6 HORAS                          │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│              TotvsBackgroundService                         │
│  • Verifica se há questionários ativos                     │
│  • Identifica período letivo atual                         │
│  • Executa sincronização se necessário                     │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│              Sincronização de Alunos                       │
│  • Busca dados em V_ALUNOS (Oracle)                        │
│  • Agrupa por RA (um aluno, múltiplas disciplinas)         │
│  • Cria/atualiza registros no MySQL                        │
│  • Associa com TurmaDisciplina                             │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│            Sincronização de Professores                    │
│  • Busca dados em V_PROFESSORES (Oracle)                   │
│  • Agrupa por LOGIN (um professor, múltiplas disciplinas)  │
│  • Cria/atualiza registros no MySQL                        │
│  • Associa com TurmaDisciplina                             │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Log de Sucesso                          │
│  "Sincronização concluída - Alunos: 1250, Professores: 85" │
└─────────────────────────────────────────────────────────────┘
```

### **2. 🎯 Sincronização Sob Demanda (Filtros)**

```
┌─────────────────────────────────────────────────────────────┐
│              Usuário Filtra Participantes                  │
│  GET /api/Participante/disponiveis-para-questionario/123   │
│  ?sincronizarTOTVS=true&periodoLetivo=2024/1               │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│              Verificar Necessidade de Sincronização        │
│  • Dados são recentes? (< 2 horas)                         │
│  • Usuário forçou sincronização?                           │
│  • Há questionários ativos?                                │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│              Sincronização Rápida                          │
│  • Sincroniza apenas período específico                    │
│  • Filtra por curso/turma/disciplina                       │
│  • Atualiza dados em tempo real                            │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│              Retorna Participantes Filtrados               │
│  • Alunos e professores do período                         │
│  • Apenas os não associados ao questionário                │
│  • Dados atualizados do TOTVS                              │
└─────────────────────────────────────────────────────────────┘
```

## 📊 **Cenários de Uso Práticos**

### **Cenário 1: Uso Normal (Automático)**

**Situação:** Coordenador cria avaliação de Matemática + Português

**Fluxo:**
1. **Background Service** já sincronizou dados às 6h da manhã
2. **Coordenador** acessa filtros de participantes
3. **Sistema** mostra alunos/professores atualizados (disponíveis para seleção)
4. **Coordenador** seleciona participantes manualmente
5. **Coordenador** adiciona com contexto específico (Matemática + Português)

**Resultado:** ✅ Dados sempre atualizados, seleção sempre manual pelo coordenador

### **Cenário 2: Dados Urgentes (Sob Demanda)**

**Situação:** Coordenador precisa de dados muito recentes (matrículas de hoje)

**Fluxo:**
1. **Coordenador** marca `sincronizarTOTVS=true` no filtro
2. **Sistema** verifica se dados são antigos (> 2 horas)
3. **Sistema** sincroniza dados do TOTVS em tempo real
4. **Sistema** retorna participantes com dados mais recentes (disponíveis para seleção)
5. **Coordenador** seleciona participantes atualizados manualmente

**Resultado:** ✅ Dados em tempo real quando necessário, seleção sempre manual

### **Cenário 3: Problema no Background (Fallback)**

**Situação:** Background service falhou por problema de rede

**Fluxo:**
1. **Coordenador** percebe dados desatualizados
2. **Coordenador** marca `forcarSincronizacao=true`
3. **Sistema** força sincronização imediatamente
4. **Sistema** atualiza todos os dados (disponíveis para seleção)
5. **Coordenador** seleciona participantes com dados atualizados

**Resultado:** ✅ Redundância garante dados sempre atualizados, seleção sempre manual

## 🎯 **Exemplo Prático: Avaliação de Disciplinas**

### **Passo 1: Criação da Avaliação**
```
Coordenador cria avaliação:
- Título: "Avaliação de Desempenho - 2024/1"
- Tipo: Por Disciplina
- Disciplinas: Matemática, Português
- Período: 2024/1
```

### **Passo 2: Filtro de Participantes (Dados Disponíveis)**
```
GET /api/Participante/disponiveis-para-questionario/123
?sincronizarTOTVS=true
&tipoParticipante=Aluno
&periodoLetivo=2024/1
&disciplinaId=1,2  // Matemática e Português
```

**Resposta do Sistema (Dados Disponíveis para Seleção):**
```json
{
  "questionarioId": 123,
  "filtros": {
    "tipoParticipante": "Aluno",
    "periodoLetivo": "2024/1",
    "disciplinaId": [1, 2],
    "sincronizarTOTVS": true
  },
  "totalParticipantes": 45,
  "participantes": [
    {
      "id": 1,
      "nome": "João Silva",
      "email": "joao@email.com",
      "tipo": "Aluno",
      "aluno": {
        "matricula": "12345",
        "curso": "Engenharia",
        "turmasDisciplinas": [
          {
            "id": 101,
            "disciplina": "Matemática",
            "professor": "Prof. Maria",
            "turma": "Turma A"
          },
          {
            "id": 102,
            "disciplina": "Português", 
            "professor": "Prof. Carlos",
            "turma": "Turma A"
          }
        ]
      }
    }
  ]
}
```

**⚠️ IMPORTANTE:** Os participantes são apenas **listados** - não são adicionados automaticamente!

### **Passo 3: Seleção Manual pelo Coordenador**
```
Coordenador seleciona participantes na interface:
- ☑️ João Silva (Matemática + Português)
- ☑️ Maria Santos (Matemática + Português)
- ☑️ Pedro Costa (Matemática + Português)
```

### **Passo 4: Adição Manual de Participantes**
```
POST /api/ParticipanteQuestionario/adicionar-com-contexto
{
  "questionarioId": 123,
  "participanteIds": [1, 2, 3],
  "disciplinaId": 1,  // Matemática
  "tipoItemAvaliado": "Disciplina",
  "nomeItemEspecifico": "Matemática"
}
```

**Resultado:**
- ✅ Coordenador adiciona João Silva para avaliar Matemática
- ✅ Contexto específico é salvo (disciplina, professor, turma)
- ✅ Sistema gera convite único para João

### **Passo 5: Acesso do Aluno**
```
João Silva acessa: /questionario/ABC123
```

**Sistema retorna:**
```json
{
  "questionario": {
    "titulo": "Avaliação de Desempenho - 2024/1",
    "questoes": [...]
  },
  "itensAvaliados": [
    {
      "id": 101,
      "nomeItemEspecifico": "Matemática",
      "descricaoItem": "Disciplina: Matemática | Professor: Prof. Maria",
      "professorId": 789,
      "disciplinaId": 1
    }
  ]
}
```

**Frontend renderiza:**
```
┌─────────────────────────────────────┐
│ 📚 Matemática                       │
│ Disciplina: Matemática - Prof. Maria│
│ ┌─────────────────────────────────┐ │
│ │ Questão 1: Como avalia...?      │ │
│ │ [ ] Excelente [ ] Bom [ ] Ruim  │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## 🔄 **Fluxo de Dados Completo**

### **TOTVS → Sistema Local**
```
V_ALUNOS (Oracle) ──┐
                    ├── TotvsService ──┐
V_PROFESSORES (Oracle) ──┘              │
                                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    MySQL Local                             │
│  • Alunos (com campos de integração)                      │
│  • Professores (com campos de integração)                 │
│  • TurmaDisciplina (relacionamentos N:N)                  │
│  • ParticipanteQuestionario (com contexto)                │
└─────────────────────────────────────────────────────────────┘
```

### **Sistema Local → Frontend**
```
MySQL ──┐
        ├── API Endpoints ──┐
        │                   ▼
        │            Frontend React
        │            • Filtros de participantes
        │            • Seleção de contextos
        │            • Interface de avaliação
        │
        └── Background Service ──┐
                                 ▼
                            Logs de Sincronização
```

## 🎯 **Benefícios da Implementação**

### **✅ Para o Coordenador**
- **Dados sempre atualizados** automaticamente (disponíveis para seleção)
- **Filtros precisos** por período/curso/turma/disciplina
- **Sincronização sob demanda** quando necessário
- **Interface intuitiva** para seleção manual de participantes
- **Controle total** sobre quem é adicionado nas avaliações

### **✅ Para o Aluno/Professor**
- **Avaliação unificada** de múltiplas disciplinas
- **Contexto específico** para cada disciplina
- **Interface clara** mostrando o que avaliar
- **Experiência otimizada** com dados corretos

### **✅ Para o Sistema**
- **Performance otimizada** com background service
- **Redundância** com sincronização sob demanda
- **Logs detalhados** para monitoramento
- **Escalabilidade** para grandes volumes

## 🚀 **Conclusão**

A integração TOTVS funciona de forma **inteligente e controlada**:

1. **🔄 Background Service** mantém dados sempre atualizados (disponíveis para seleção)
2. **🎯 Sincronização sob demanda** para necessidades específicas
3. **📊 Filtros precisos** com contexto específico
4. **👤 Seleção manual** pelo coordenador (nunca automática)
5. **🎨 Interface unificada** para múltiplas disciplinas
6. **🔍 Rastreamento completo** de todas as operações

**O sistema garante que coordenadores tenham acesso aos dados mais atualizados do TOTVS para seleção manual, com controle total sobre quem participa das avaliações!** 🎯✨
