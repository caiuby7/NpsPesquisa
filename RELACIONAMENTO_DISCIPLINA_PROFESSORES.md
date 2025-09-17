# 🔗 Relacionamento DisciplinaProfessores

## 🔍 **Estrutura do Relacionamento**

### **Tabela de Junção N:N:**
```sql
-- Tabela DisciplinaProfessor (N:N)
CREATE TABLE DisciplinaProfessor (
    DisciplinasId INT NOT NULL,
    ProfessoresId INT NOT NULL,
    PRIMARY KEY (DisciplinasId, ProfessoresId),
    FOREIGN KEY (DisciplinasId) REFERENCES disciplinas(Id),
    FOREIGN KEY (ProfessoresId) REFERENCES professores(Id)
);
```

### **Modelos Entity Framework:**
```csharp
// Modelo Disciplina
public class Disciplina
{
    public int Id { get; set; }
    public string Nome { get; set; }
    
    // Relacionamento N:N com Professores
    public virtual ICollection<Professor> Professores { get; set; } = new List<Professor>();
}

// Modelo Professor  
public class Professor
{
    public int Id { get; set; }
    public string Nome { get; set; }
    
    // Relacionamento N:N com Disciplinas
    public virtual ICollection<Disciplina> Disciplinas { get; set; } = new List<Disciplina>();
}
```

## 🛠️ **Implementação Corrigida**

### **Antes (INCORRETO):**
```csharp
// ❌ Tentava acessar tabela de junção diretamente
var disciplinaProfessor = await _context.DisciplinaProfessores
    .FirstOrDefaultAsync(dp => dp.DisciplinaId == itemAvaliado.DisciplinaId && 
                               dp.ProfessorId == professor.Id);
```

### **Depois (CORRETO):**
```csharp
// ✅ Usa relacionamento configurado no EF
var disciplina = await _context.Disciplinas
    .Include(d => d.Professores)
    .FirstOrDefaultAsync(d => d.Id == itemAvaliado.DisciplinaId.Value);

if (disciplina != null && disciplina.Professores.Any(p => p.Id == professor.Id))
    return true;
```

## 🎯 **Como Funciona**

### **1. Busca a Disciplina:**
```csharp
var disciplina = await _context.Disciplinas
    .Include(d => d.Professores)  // ← Carrega professores relacionados
    .FirstOrDefaultAsync(d => d.Id == itemAvaliado.DisciplinaId.Value);
```

### **2. Verifica se Professor está na Lista:**
```csharp
if (disciplina != null && disciplina.Professores.Any(p => p.Id == professor.Id))
    return true;  // ← Professor leciona esta disciplina
```

## 📊 **Exemplo Prático**

### **Cenário: Professor João leciona Matemática**
```
1. Disciplina: { Id: 1, Nome: "Matemática" }
2. Professor: { Id: 123, Nome: "João Silva" }
3. DisciplinaProfessor: { DisciplinasId: 1, ProfessoresId: 123 }
```

### **Query EF Gerada:**
```sql
SELECT d.*, p.*
FROM disciplinas d
INNER JOIN DisciplinaProfessor dp ON d.Id = dp.DisciplinasId
INNER JOIN professores p ON dp.ProfessoresId = p.Id
WHERE d.Id = 1
```

### **Resultado:**
```csharp
disciplina.Professores = [
    { Id: 123, Nome: "João Silva" },
    { Id: 456, Nome: "Maria Santos" }
]

// Verifica se professor.Id (123) está na lista
disciplina.Professores.Any(p => p.Id == 123) // ✅ TRUE
```

## 🔄 **Fluxo Completo de Verificação**

### **Para Professor em Avaliação de Disciplina:**
```
1. Usuario → Professor (via UsuarioId)
2. Professor → Disciplina (via relacionamento N:N)
3. Verifica se Professor leciona Disciplina específica
4. Se sim → Professor é participante da avaliação
```

### **Implementação:**
```csharp
// Para avaliações de disciplina que ele leciona
if (itemAvaliado.DisciplinaId.HasValue)
{
    var disciplina = await _context.Disciplinas
        .Include(d => d.Professores)
        .FirstOrDefaultAsync(d => d.Id == itemAvaliado.DisciplinaId.Value);
    
    if (disciplina != null && disciplina.Professores.Any(p => p.Id == professor.Id))
        return true; // Professor leciona esta disciplina
}
```

## ✅ **Benefícios da Abordagem**

### **1. Usa Relacionamentos EF:**
- ✅ **Configuração automática** do relacionamento N:N
- ✅ **Include()** carrega dados relacionados
- ✅ **Linq** para verificações simples

### **2. Performance:**
- ✅ **Uma query** com JOIN otimizado
- ✅ **Include()** evita N+1 queries
- ✅ **Any()** para verificação eficiente

### **3. Manutenibilidade:**
- ✅ **Código limpo** usando relacionamentos
- ✅ **Fácil debug** e entendimento
- ✅ **Consistente** com padrões EF

## 🔗 **Outros Relacionamentos N:N**

### **AlunoTurmaDisciplina:**
```sql
-- Tabela de junção para Alunos em TurmaDisciplinas
CREATE TABLE AlunoTurmaDisciplina (
    AlunosAlunoId INT NOT NULL,
    TurmasDisciplinasId INT NOT NULL,
    PRIMARY KEY (AlunosAlunoId, TurmasDisciplinasId)
);
```

### **Uso Similar:**
```csharp
// Para verificar se aluno está em TurmaDisciplina
var turmaDisciplina = await _context.TurmaDisciplinas
    .Include(td => td.Alunos)
    .FirstOrDefaultAsync(td => td.Id == itemAvaliado.TurmaDisciplinaId);

if (turmaDisciplina != null && turmaDisciplina.Alunos.Any(a => a.AlunoId == aluno.AlunoId))
    return true;
```

## 🚀 **Resultado Final**

### **✅ Relacionamento Correto:**
- **DisciplinaProfessores** é tabela de junção N:N
- **Entity Framework** gerencia automaticamente
- **Include()** carrega professores relacionados
- **Any()** verifica se professor leciona disciplina

### **✅ Verificação Funcionando:**
- Professor que leciona disciplina específica → **Participante**
- Professor que não leciona disciplina → **Não participante**
- Avaliações filtradas corretamente por contexto

O sistema agora verifica corretamente se o professor leciona a disciplina através do relacionamento N:N! 🎉
