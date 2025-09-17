# 🎯 Busca Específica por Tipo de Item Avaliado

## 📋 **Como Funciona Agora**

### **1. Lógica de Seleção de View**

O sistema agora escolhe automaticamente qual view usar baseado no tipo de item avaliado:

| Tipo de Item Avaliado | View Utilizada | Descrição |
|----------------------|----------------|-----------|
| `Disciplina` | `V_ALUNOS` + `V_ALUNOS_ESTAGIOS` | Disciplinas regulares + especiais |
| `Professor` | `V_PROFESSORES` + `V_PROFESSORES_ESTAGIOS` | Professores regulares + especiais |
| `TCC` | `V_ALUNOS_ESTAGIOS` | Apenas disciplinas de TCC |
| `Estagio` | `V_ALUNOS_ESTAGIOS` | Apenas disciplinas de estágio |
| `ProjetoExtensionista` | `V_ALUNOS_ESTAGIOS` | Apenas disciplinas de PAC |

### **2. Implementação no Código**

```csharp
// Determinar se deve buscar apenas nas views de estágio
bool buscarApenasEstagios = tipoItemAvaliado.HasValue && 
    (tipoItemAvaliado == TipoItemAvaliado.TCC || 
     tipoItemAvaliado == TipoItemAvaliado.Estagio || 
     tipoItemAvaliado == TipoItemAvaliado.ProjetoExtensionista);

// Escolher qual query usar
if (buscarApenasEstagios)
{
    // Buscar apenas nas views de estágio (TCC, Estágios, PACs)
    query = queryEstagios;
}
else
{
    // Buscar em ambas as views (regulares + especiais)
    query = $"({queryPrincipal}) UNION ALL ({queryEstagios})";
}
```

## 🎯 **Exemplos Práticos**

### **Exemplo 1: Avaliação de Disciplina Regular**
```
TipoItemAvaliado: "Disciplina"
TipoParticipante: "Aluno"
Disciplina: "Matemática I"

Resultado:
- Busca em V_ALUNOS e V_ALUNOS_ESTAGIOS
- Encontra alunos de Matemática I
- Identifica como tipo "Disciplina"
```

### **Exemplo 2: Avaliação de TCC**
```
TipoItemAvaliado: "TCC"
TipoParticipante: "Aluno"
Disciplina: "TCC - Trabalho de Conclusão"

Resultado:
- Busca APENAS em V_ALUNOS_ESTAGIOS
- Encontra apenas alunos de TCC
- Identifica como tipo "TCC"
```

### **Exemplo 3: Avaliação de Estágio**
```
TipoItemAvaliado: "Estagio"
TipoParticipante: "Professor"
Disciplina: "Estágio Supervisionado"

Resultado:
- Busca APENAS em V_PROFESSORES_ESTAGIOS
- Encontra apenas professores de estágio
- Identifica como tipo "Estagio"
```

## 🔄 **Fluxo de Busca**

### **1. Coordenador Seleciona Filtros**
```
Questionário: "Avaliação de TCC"
TipoItemAvaliado: "TCC"
Filtros: Período 2024/1, Curso Engenharia
```

### **2. Sistema Identifica Tipo**
```
tipoItemAvaliado = "TCC"
buscarApenasEstagios = true (TCC é tipo especial)
```

### **3. Sistema Escolhe View**
```
query = queryEstagios; // Apenas V_ALUNOS_ESTAGIOS
```

### **4. Sistema Executa Busca**
```sql
SELECT DISTINCT
    ae.PERIODO_LETIVO, ae.RA, ae.NOME, ae.EMAIL,
    ae.COD_CURSO_DO_ALUNO, ae.CURSO_DO_ALUNO,
    ae.CODFILIAL, ae.FILIAL_NOME,
    ae.IDTURMADISC, ae.CODIGO_DISCIPLINA, ae.NOME_DISCIPLINA,
    ae.CODTURMA, ae.CURSO_DA_TURMA, ae.FASE,
    'ESTAGIO' as TIPO_DISCIPLINA
FROM V_ALUNOS_ESTAGIOS ae
WHERE ae.TURMA_ATIVA = 'S'
AND ae.PERIODO_LETIVO = '2024/1'
AND ae.COD_CURSO_DO_ALUNO = 'ENG001'
```

### **5. Sistema Identifica Tipo Específico**
```
disciplinaNome = "TCC - Trabalho de Conclusão"
tipoItemAvaliado = "TCC" (identificado pelo nome)
```

## ✅ **Benefícios da Implementação**

### **🎯 Para o Sistema**
- **Performance otimizada** - busca apenas onde necessário
- **Precisão aumentada** - não mistura disciplinas regulares com especiais
- **Lógica clara** - cada tipo tem sua view específica
- **Flexibilidade** - suporta todos os tipos de avaliação

### **🎯 Para o Coordenador**
- **Resultados precisos** - apenas participantes relevantes
- **Interface simplificada** - sistema escolhe automaticamente
- **Contexto correto** - tipo específico salvo automaticamente
- **Eficiência** - não precisa especificar view manualmente

### **🎯 Para os Participantes**
- **Avaliação específica** - apenas o que devem avaliar
- **Contexto claro** - tipo de item bem definido
- **Experiência otimizada** - interface personalizada por tipo

## 🚀 **Resultado Final**

**Agora o sistema:**
- ✅ **Escolhe automaticamente** a view correta baseada no tipo
- ✅ **Busca apenas onde necessário** (performance otimizada)
- ✅ **Identifica precisamente** o tipo de item avaliado
- ✅ **Salva contexto específico** para cada participante

**TCC, Estágios e PACs agora são buscados APENAS nas views específicas, garantindo precisão e performance!** 🎯✨
