# 🎯 Identificação Automática de Tipos de Item Avaliado

## 📋 **Como Funciona a Identificação**

### **1. Views do TOTVS**
- **`V_ALUNOS`** e **`V_PROFESSORES`** - Disciplinas regulares
- **`V_ALUNOS_ESTAGIOS`** e **`V_PROFESSORES_ESTAGIOS`** - Disciplinas especiais (TCC, Estágios, PACs)

### **2. Identificação Automática**
O sistema identifica automaticamente o tipo de item avaliado baseado no nome da disciplina:

```csharp
// Disciplinas regulares (V_ALUNOS/V_PROFESSORES)
TipoItemAvaliado = "Disciplina"

// Disciplinas especiais (V_ALUNOS_ESTAGIOS/V_PROFESSORES_ESTAGIOS)
if (disciplinaNome.Contains("TCC") || disciplinaNome.Contains("TRABALHO DE CONCLUSÃO"))
    TipoItemAvaliado = "TCC"
else if (disciplinaNome.Contains("ESTÁGIO") || disciplinaNome.Contains("ESTAGIO"))
    TipoItemAvaliado = "Estagio"
else if (disciplinaNome.Contains("PAC"))
    TipoItemAvaliado = "ProjetoExtensionista"
else
    TipoItemAvaliado = "Estagio" // Padrão para disciplinas de estágio
```

## 🎯 **Exemplos Práticos**

### **Disciplinas Regulares (V_ALUNOS)**
```
Nome da Disciplina: "Matemática I"
Tipo Identificado: "Disciplina"
View Utilizada: V_ALUNOS
```

### **TCC (V_ALUNOS_ESTAGIOS)**
```
Nome da Disciplina: "TCC - Trabalho de Conclusão de Curso"
Tipo Identificado: "TCC"
View Utilizada: V_ALUNOS_ESTAGIOS
```

### **Estágio (V_ALUNOS_ESTAGIOS)**
```
Nome da Disciplina: "Estágio Supervisionado"
Tipo Identificado: "Estagio"
View Utilizada: V_ALUNOS_ESTAGIOS
```

### **PAC (V_ALUNOS_ESTAGIOS)**
```
Nome da Disciplina: "PAC - Projeto de Aprendizagem Comunitária"
Tipo Identificado: "ProjetoExtensionista"
View Utilizada: V_ALUNOS_ESTAGIOS
```

## 🔄 **Fluxo de Busca**

### **1. Query Combinada**
```sql
-- Busca em ambas as views
(SELECT *, 'REGULAR' as TIPO_DISCIPLINA FROM V_ALUNOS WHERE TURMA_ATIVA = 'S')
UNION ALL
(SELECT *, 'ESTAGIO' as TIPO_DISCIPLINA FROM V_ALUNOS_ESTAGIOS WHERE TURMA_ATIVA = 'S')
```

### **2. Identificação por Nome**
```csharp
// Para cada participante encontrado
if (tipoDisciplina == "ESTAGIO")
{
    // Analisa o nome da disciplina para identificar o tipo específico
    if (disciplinaNome.Contains("TCC"))
        tipoItemAvaliado = "TCC";
    else if (disciplinaNome.Contains("ESTÁGIO"))
        tipoItemAvaliado = "Estagio";
    else if (disciplinaNome.Contains("PAC"))
        tipoItemAvaliado = "ProjetoExtensionista";
}
```

### **3. Adição com Contexto**
```csharp
// Adiciona participante com tipo identificado
var participanteQuestionario = new ParticipanteQuestionario
{
    TipoItemAvaliado = tipoItemAvaliado, // Tipo identificado automaticamente
    NomeItemEspecifico = disciplinaNome,  // Nome da disciplina do TOTVS
    // ... outros campos de contexto
};
```

## ✅ **Benefícios da Identificação Automática**

### **🎯 Para o Sistema**
- **Identificação precisa** do tipo de avaliação
- **Contexto correto** salvo automaticamente
- **Compatibilidade** com diferentes tipos de disciplina
- **Flexibilidade** para novos tipos no futuro

### **🎯 Para o Coordenador**
- **Não precisa especificar** o tipo manualmente
- **Sistema identifica automaticamente** TCC, Estágio, PAC
- **Contexto correto** salvo para cada participante
- **Interface simplificada** - apenas seleciona filtros

### **🎯 Para os Participantes**
- **Avaliação específica** para cada tipo de disciplina
- **Contexto claro** do que estão avaliando
- **Experiência personalizada** por tipo de item

## 🎯 **Resultado Final**

**O sistema agora:**
1. **Busca em ambas as views** (regular + estágios)
2. **Identifica automaticamente** o tipo baseado no nome
3. **Adiciona participantes** com contexto específico
4. **Salva tipo correto** para cada disciplina

**Exemplo de resultado:**
```json
{
  "participantes": [
    {
      "nome": "João Silva",
      "disciplinaNome": "Matemática I",
      "tipoItemAvaliado": "Disciplina"
    },
    {
      "nome": "Maria Santos", 
      "disciplinaNome": "TCC - Trabalho de Conclusão",
      "tipoItemAvaliado": "TCC"
    },
    {
      "nome": "Pedro Costa",
      "disciplinaNome": "Estágio Supervisionado",
      "tipoItemAvaliado": "Estagio"
    }
  ]
}
```

**Agora o sistema identifica automaticamente TCC, Estágios e PACs, salvando o contexto correto para cada tipo de avaliação!** 🎯✨
