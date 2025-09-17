# 🔍 Fluxo: Buscar e Adicionar do TOTVS

## 🎯 **Como Funciona Agora**

### **1. Coordenador Clica "Adicionar Participante"**
```
Interface mostra:
┌─────────────────────────────────────┐
│ 📝 Adicionar Participantes          │
│                                     │
│ 🔍 Filtros:                         │
│ • Período Letivo: [2024/1    ▼]     │
│ • Curso: [Engenharia        ▼]      │
│ • Turma: [Turma A          ▼]       │
│ • Disciplina: [Matemática  ▼]       │
│ • Tipo: [Aluno/Professor   ▼]       │
│                                     │
│ [🔍 Buscar no TOTVS]                │
└─────────────────────────────────────┘
```

### **2. Coordenador Seleciona Filtros e Clica "Buscar"**
```
POST /api/ParticipanteQuestionario/buscar-e-adicionar-do-totvs
{
  "questionarioId": 123,
  "periodoLetivo": "2024/1",
  "cursoId": 1,
  "turmaId": 5,
  "disciplinaId": 2,
  "tipoParticipante": "Aluno",
  "nomeItemEspecifico": "Matemática"
}
```

### **3. Sistema Busca no TOTVS**
```
Sistema executa:
1. 🔍 Conecta no TOTVS (Oracle)
2. 🔍 Executa query com filtros:
   SELECT DISTINCT a.RA, a.NOME, a.EMAIL, a.CURSO_DO_ALUNO...
   FROM V_ALUNOS a
   WHERE a.PERIODO_LETIVO = '2024/1'
   AND a.COD_CURSO_DO_ALUNO = 'ENG001'
   AND a.CODTURMA = 'TURMA_A'
   AND a.CODIGO_DISCIPLINA = 'MAT001'
   AND a.TURMA_ATIVA = 'S'
3. 🔍 Retorna lista de alunos encontrados
```

### **4. Sistema Verifica e Adiciona Automaticamente**
```
Para cada aluno encontrado no TOTVS:

✅ Verifica se já existe na base local:
   - Busca por RA (aluno) ou Login (professor)
   - Se não existe, cria novo participante

✅ Verifica se já está no questionário:
   - Busca em ParticipanteQuestionario
   - Se não está, adiciona com contexto

✅ Adiciona ao questionário:
   - Salva contexto específico (disciplina, turma, curso)
   - Gera convite único
   - Registra data de adição
```

### **5. Sistema Retorna Resultado**
```json
{
  "message": "Busca no TOTVS concluída. 15 participantes adicionados ao questionário.",
  "totalEncontrados": 15,
  "totalAdicionados": 15,
  "participantes": [
    {
      "id": 1,
      "nome": "João Silva",
      "email": "joao@email.com",
      "tipo": "Aluno",
      "ra": "12345",
      "contexto": "Disciplina: Matemática | Turma: Turma A | Curso: Engenharia"
    },
    {
      "id": 2,
      "nome": "Maria Santos",
      "email": "maria@email.com",
      "tipo": "Aluno",
      "ra": "12346",
      "contexto": "Disciplina: Matemática | Turma: Turma A | Curso: Engenharia"
    }
  ]
}
```

## 🎯 **Exemplo Prático Completo**

### **Situação:** Avaliação de Matemática para Turma A

**Passo 1: Coordenador acessa interface**
- Clica "Adicionar Participantes"
- Seleciona filtros:
  - Período: 2024/1
  - Curso: Engenharia
  - Turma: Turma A
  - Disciplina: Matemática
  - Tipo: Aluno

**Passo 2: Coordenador clica "Buscar no TOTVS"**
- Sistema vai no TOTVS
- Busca alunos que fazem Matemática na Turma A
- Encontra 15 alunos

**Passo 3: Sistema processa automaticamente**
- Verifica cada aluno na base local
- Cria participantes se necessário
- Adiciona todos ao questionário
- Salva contexto específico

**Passo 4: Coordenador vê resultado**
- "15 participantes adicionados com sucesso!"
- Lista mostra todos os alunos adicionados
- Cada um com contexto específico

## 🔄 **Fluxo Detalhado**

```
┌─────────────────────────────────────────────────────────────┐
│                    COORDENADOR                              │
│ 1. Clica "Adicionar Participante"                          │
│ 2. Seleciona filtros (período, curso, turma, disciplina)   │
│ 3. Clica "Buscar no TOTVS"                                │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    SISTEMA                                  │
│ 4. Valida questionário                                      │
│ 5. Conecta no TOTVS (Oracle)                               │
│ 6. Executa query com filtros                               │
│ 7. Retorna lista de participantes                          │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    PROCESSAMENTO                            │
│ Para cada participante encontrado:                         │
│ 8. Verifica se existe na base local                        │
│ 9. Cria participante se necessário                         │
│ 10. Verifica se já está no questionário                    │
│ 11. Adiciona ao questionário com contexto                  │
│ 12. Gera convite único                                     │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    RESULTADO                                │
│ 13. Retorna lista de participantes adicionados             │
│ 14. Mostra contexto específico de cada um                  │
│ 15. Coordenador vê resultado na interface                  │
└─────────────────────────────────────────────────────────────┘
```

## ✅ **Vantagens da Nova Implementação**

### **🎯 Para o Coordenador**
- **Busca em tempo real** no TOTVS
- **Filtros precisos** por período/curso/turma/disciplina
- **Adição automática** dos participantes encontrados
- **Contexto específico** salvo automaticamente
- **Sem duplicatas** - sistema verifica se já existe

### **🎯 Para o Sistema**
- **Dados sempre atualizados** do TOTVS
- **Verificação inteligente** de duplicatas
- **Contexto preservado** para cada participante
- **Performance otimizada** com queries específicas
- **Logs detalhados** para monitoramento

### **🎯 Para os Participantes**
- **Convites únicos** gerados automaticamente
- **Contexto claro** do que devem avaliar
- **Dados atualizados** do TOTVS
- **Experiência unificada** na avaliação

## 🚀 **Resultado Final**

**Agora o fluxo é muito mais eficiente:**

1. **Coordenador** seleciona filtros específicos
2. **Sistema** busca no TOTVS em tempo real
3. **Sistema** adiciona automaticamente os encontrados
4. **Participantes** recebem convites com contexto específico

**O coordenador tem controle total sobre os filtros, mas a busca e adição são automáticas!** 🎯✨
