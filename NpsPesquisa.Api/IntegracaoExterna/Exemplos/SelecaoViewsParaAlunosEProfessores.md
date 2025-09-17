# 🎯 Seleção de Views para Alunos e Professores

## 📋 **Lógica Aplicada para Ambos os Tipos**

### **1. Mapeamento Completo de Views**

| Tipo de Item Avaliado | Alunos | Professores |
|----------------------|--------|-------------|
| `Disciplina` | `V_ALUNOS` | `V_PROFESSORES` |
| `TCC` | `V_ALUNOS_ESTAGIOS` | `V_PROFESSORES_ESTAGIOS` |
| `Estagio` | `V_ALUNOS_ESTAGIOS` | `V_PROFESSORES_ESTAGIOS` |
| `ProjetoExtensionista` | `V_ALUNOS_ESTAGIOS` | `V_PROFESSORES_ESTAGIOS` |
| **Outros tipos** | Ambas as views | Ambas as views |

### **2. Implementação no Código**

A mesma lógica é aplicada para ambos os tipos de participante:

```csharp
// Determinar qual view usar baseado no tipo de item avaliado
bool buscarApenasEstagios = tipoItemAvaliado.HasValue && 
    (tipoItemAvaliado == TipoItemAvaliado.TCC || 
     tipoItemAvaliado == TipoItemAvaliado.Estagio || 
     tipoItemAvaliado == TipoItemAvaliado.ProjetoExtensionista);

bool buscarApenasRegulares = tipoItemAvaliado.HasValue && 
    tipoItemAvaliado == TipoItemAvaliado.Disciplina;

// Escolher qual query usar (mesma lógica para alunos e professores)
if (buscarApenasEstagios)
    query = queryEstagios; // V_ALUNOS_ESTAGIOS ou V_PROFESSORES_ESTAGIOS
else if (buscarApenasRegulares)
    query = queryPrincipal; // V_ALUNOS ou V_PROFESSORES
else
    query = $"({queryPrincipal}) UNION ALL ({queryEstagios})"; // Ambas
```

## 🎯 **Exemplos Práticos**

### **Exemplo 1: Avaliação de Disciplina Regular**

#### **Para Alunos:**
```
TipoItemAvaliado: "Disciplina"
TipoParticipante: "Aluno"
Disciplina: "Matemática I"

Resultado:
- buscarApenasRegulares = true
- Query: SELECT * FROM V_ALUNOS WHERE...
- Encontra apenas alunos de disciplinas regulares
```

#### **Para Professores:**
```
TipoItemAvaliado: "Disciplina"
TipoParticipante: "Professor"
Disciplina: "Matemática I"

Resultado:
- buscarApenasRegulares = true
- Query: SELECT * FROM V_PROFESSORES WHERE...
- Encontra apenas professores de disciplinas regulares
```

### **Exemplo 2: Avaliação de TCC**

#### **Para Alunos:**
```
TipoItemAvaliado: "TCC"
TipoParticipante: "Aluno"
Disciplina: "TCC - Trabalho de Conclusão"

Resultado:
- buscarApenasEstagios = true
- Query: SELECT * FROM V_ALUNOS_ESTAGIOS WHERE...
- Encontra apenas alunos de TCC
```

#### **Para Professores:**
```
TipoItemAvaliado: "TCC"
TipoParticipante: "Professor"
Disciplina: "TCC - Trabalho de Conclusão"

Resultado:
- buscarApenasEstagios = true
- Query: SELECT * FROM V_PROFESSORES_ESTAGIOS WHERE...
- Encontra apenas professores de TCC
```

### **Exemplo 3: Avaliação de Professor (sem tipo específico)**

#### **Para Professores:**
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
TipoParticipante: "Professor" (ou "Aluno")
```

### **2. Sistema Identifica Tipo**
```
tipoItemAvaliado = "Disciplina"
buscarApenasRegulares = true
buscarApenasEstagios = false
```

### **3. Sistema Escolhe View**
```
Para Alunos: query = queryPrincipal; // V_ALUNOS
Para Professores: query = queryPrincipal; // V_PROFESSORES
```

### **4. Sistema Executa Busca**

#### **Para Alunos:**
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
```

#### **Para Professores:**
```sql
SELECT DISTINCT
    p.PERIODO_LETIVO, p.LOGIN, p.PROFESSOR, p.EMAIL,
    p.COD_FILIAL, p.FILIAL_NOME,
    p.IDTURMADISC, p.COD_DISC, p.DISCIPLINA,
    p.COD_TURMA, p.TURMA_GERENCIADA, p.FASE,
    'REGULAR' as TIPO_DISCIPLINA
FROM V_PROFESSORES p
WHERE p.PROF_ATIVO = 'S'
```

## ✅ **Benefícios da Implementação**

### **🎯 Consistência**
- **Mesma lógica** para alunos e professores
- **Comportamento previsível** em ambos os casos
- **Fácil manutenção** do código

### **🎯 Performance Otimizada**
- **Disciplinas regulares**: Busca apenas nas views regulares
- **TCC/Estágio/PAC**: Busca apenas nas views de estágio
- **Outros tipos**: Busca em ambas as views
- **Resultados mais rápidos** e precisos

### **🎯 Precisão Aumentada**
- **Não mistura** disciplinas regulares com especiais
- **Contexto correto** para cada tipo de avaliação
- **Resultados específicos** baseados no tipo

## 🚀 **Resultado Final**

**Agora o sistema escolhe a view correta para ambos os tipos:**

- ✅ **Disciplina** → `V_ALUNOS` ou `V_PROFESSORES` (apenas regulares)
- ✅ **TCC** → `V_ALUNOS_ESTAGIOS` ou `V_PROFESSORES_ESTAGIOS` (apenas TCC)
- ✅ **Estágio** → `V_ALUNOS_ESTAGIOS` ou `V_PROFESSORES_ESTAGIOS` (apenas estágios)
- ✅ **PAC** → `V_ALUNOS_ESTAGIOS` ou `V_PROFESSORES_ESTAGIOS` (apenas PACs)
- ✅ **Outros** → Ambas as views (flexibilidade)

**A lógica funciona perfeitamente para alunos e professores, garantindo precisão e performance!** 🎯✨
