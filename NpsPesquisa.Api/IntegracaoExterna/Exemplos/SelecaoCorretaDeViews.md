# 🎯 Seleção Correta de Views por Tipo de Item Avaliado

## 📋 **Lógica de Seleção Implementada**

### **1. Tipos de Item Avaliado e Views Correspondentes**

| Tipo de Item Avaliado | View Utilizada | Motivo |
|----------------------|----------------|--------|
| `Disciplina` | `V_ALUNOS` | Disciplinas regulares apenas |
| `TCC` | `V_ALUNOS_ESTAGIOS` | Apenas disciplinas de TCC |
| `Estagio` | `V_ALUNOS_ESTAGIOS` | Apenas disciplinas de estágio |
| `ProjetoExtensionista` | `V_ALUNOS_ESTAGIOS` | Apenas disciplinas de PAC |
| **Outros tipos** | `V_ALUNOS` + `V_ALUNOS_ESTAGIOS` | Busca em ambas as views |

### **2. Implementação no Código**

```csharp
// Determinar qual view usar baseado no tipo de item avaliado
bool buscarApenasEstagios = tipoItemAvaliado.HasValue && 
    (tipoItemAvaliado == TipoItemAvaliado.TCC || 
     tipoItemAvaliado == TipoItemAvaliado.Estagio || 
     tipoItemAvaliado == TipoItemAvaliado.ProjetoExtensionista);

bool buscarApenasRegulares = tipoItemAvaliado.HasValue && 
    tipoItemAvaliado == TipoItemAvaliado.Disciplina;

// Escolher qual query usar
if (buscarApenasEstagios)
{
    // Buscar apenas nas views de estágio (TCC, Estágios, PACs)
    query = queryEstagios;
}
else if (buscarApenasRegulares)
{
    // Buscar apenas nas views regulares (Disciplinas)
    query = queryPrincipal;
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
- buscarApenasRegulares = true
- Query: SELECT * FROM V_ALUNOS WHERE...
- Encontra apenas alunos de disciplinas regulares
```

### **Exemplo 2: Avaliação de TCC**
```
TipoItemAvaliado: "TCC"
TipoParticipante: "Aluno"
Disciplina: "TCC - Trabalho de Conclusão"

Resultado:
- buscarApenasEstagios = true
- Query: SELECT * FROM V_ALUNOS_ESTAGIOS WHERE...
- Encontra apenas alunos de TCC
```

### **Exemplo 3: Avaliação de Professor (sem tipo específico)**
```
TipoItemAvaliado: "Professor"
TipoParticipante: "Professor"

Resultado:
- buscarApenasEstagios = false
- buscarApenasRegulares = false
- Query: SELECT * FROM (V_PROFESSORES UNION ALL V_PROFESSORES_ESTAGIOS) WHERE...
- Encontra professores de todas as disciplinas
```

## 🔄 **Fluxo de Funcionamento**

### **1. Coordenador Cria Avaliação**
```
TipoItemAvaliado: "Disciplina"
TipoParticipante: "Aluno"
```

### **2. Sistema Identifica Tipo**
```
tipoItemAvaliado = "Disciplina"
buscarApenasRegulares = true
buscarApenasEstagios = false
```

### **3. Sistema Escolhe View**
```
query = queryPrincipal; // Apenas V_ALUNOS
```

### **4. Sistema Executa Busca**
```sql
SELECT DISTINCT
    a.PERIODO_LETIVO, a.RA, a.NOME, a.EMAIL,
    a.COD_CURSO_DO_ALUNO, a.CURSO_DO_ALUNO,
    a.CODFILIAL, a.FILIAL_NOME,
    a.IDTURMADISC, a.CODIGO_DISCIPLINA, a.NOME_DISCIPLINA,
    a.CODTURMA, a.CURSO_DA_TURMA, a.FASE,
    'REGULAR' as TIPO_DISCIPLINA
FROM V_ALUNOS a
WHERE a.TURMA_ATIVA = 'S'
AND a.PERIODO_LETIVO = '2024/1'
```

## ✅ **Benefícios da Implementação**

### **🎯 Performance Otimizada**
- **Disciplinas regulares**: Busca apenas em `V_ALUNOS`
- **TCC/Estágio/PAC**: Busca apenas em `V_ALUNOS_ESTAGIOS`
- **Outros tipos**: Busca em ambas as views
- **Resultados mais rápidos** e precisos

### **🎯 Precisão Aumentada**
- **Não mistura** disciplinas regulares com especiais
- **Contexto correto** para cada tipo de avaliação
- **Resultados específicos** baseados no tipo

### **🎯 Lógica Clara**
- **Cada tipo** tem sua view específica
- **Fácil manutenção** e entendimento
- **Escalável** para novos tipos

## 🚀 **Resultado Final**

**Agora o sistema escolhe a view correta baseada no tipo:**

- ✅ **Disciplina** → `V_ALUNOS` (apenas disciplinas regulares)
- ✅ **TCC** → `V_ALUNOS_ESTAGIOS` (apenas TCC)
- ✅ **Estágio** → `V_ALUNOS_ESTAGIOS` (apenas estágios)
- ✅ **PAC** → `V_ALUNOS_ESTAGIOS` (apenas PACs)
- ✅ **Outros** → Ambas as views (flexibilidade)

**Cada tipo de avaliação agora busca na view mais apropriada, garantindo precisão e performance!** 🎯✨
