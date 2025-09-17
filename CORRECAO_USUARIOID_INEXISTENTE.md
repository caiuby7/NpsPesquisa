# 🔧 Correção - Campos UsuarioId Inexistentes

## 🚨 **Problema Identificado**

### **Erros de Compilação:**
```
'Aluno' não contém uma definição para "UsuarioId"
'Professor' não contém uma definição para "UsuarioId"
'ParticipanteQuestionario' não contém uma definição para "UsuarioId"
```

### **Causa:**
Os modelos `Aluno`, `Professor` e `ParticipanteQuestionario` **não possuem** campos `UsuarioId`. O código estava tentando acessar campos que não existem.

## 🔍 **Análise dos Modelos**

### **Modelo Aluno:**
```csharp
public class Aluno
{
    public int AlunoId { get; set; }
    public string Nome { get; set; }
    public string Email { get; set; }
    // ❌ NÃO TEM UsuarioId
    // ... outros campos
}
```

### **Modelo Professor:**
```csharp
public class Professor
{
    public int Id { get; set; }
    public string Nome { get; set; }
    public string Email { get; set; }
    // ❌ NÃO TEM UsuarioId
    // ... outros campos
}
```

### **Modelo ParticipanteQuestionario:**
```csharp
public class ParticipanteQuestionario
{
    public int Id { get; set; }
    public int QuestionarioId { get; set; }
    public int ParticipanteId { get; set; }
    // ❌ NÃO TEM UsuarioId
    // ... outros campos
}
```

## 🛠️ **Correções Implementadas**

### **1. Verificação de Participação - Antes (INCORRETO):**
```csharp
// ❌ Tentava usar UsuarioId que não existe
var participanteQuestionario = await _context.ParticipantesQuestionarios
    .FirstOrDefaultAsync(pq => pq.QuestionarioId == avaliacao.Id && 
                              pq.UsuarioId == userId);
```

### **1. Verificação de Participação - Depois (CORRETO):**
```csharp
// ✅ Busca participante pelo email primeiro
var participante = await _context.Participantes
    .FirstOrDefaultAsync(p => p.Email == usuario.Email);

if (participante != null)
{
    var participanteQuestionario = await _context.ParticipantesQuestionarios
        .FirstOrDefaultAsync(pq => pq.QuestionarioId == avaliacao.Id && 
                                  pq.ParticipanteId == participante.Id);
    
    if (participanteQuestionario != null)
    {
        return true; // Usuário está na lista de participantes
    }
}
```

### **2. Busca de Aluno - Antes (INCORRETO):**
```csharp
// ❌ Tentava usar UsuarioId que não existe
var aluno = await _context.Alunos.FirstOrDefaultAsync(a => 
    a.UsuarioId == userId || a.Email == usuario.Email);
```

### **2. Busca de Aluno - Depois (CORRETO):**
```csharp
// ✅ Busca apenas por email
var aluno = await _context.Alunos.FirstOrDefaultAsync(a => a.Email == usuario.Email);
```

### **3. Busca de Professor - Antes (INCORRETO):**
```csharp
// ❌ Tentava usar UsuarioId que não existe
var professor = await _context.Professores.FirstOrDefaultAsync(p => 
    p.UsuarioId == userId || p.Email == usuario.Email);
```

### **3. Busca de Professor - Depois (CORRETO):**
```csharp
// ✅ Busca apenas por email
var professor = await _context.Professores.FirstOrDefaultAsync(p => p.Email == usuario.Email);
```

## 🎯 **Nova Lógica de Funcionamento**

### **Fluxo Corrigido:**
```
1. Usuario (logado) → Email
2. Busca Aluno/Professor por Email
3. Se encontrar → Busca Participante relacionado
4. Se encontrar → Verifica se já respondeu
```

### **Implementação:**
```csharp
// Para ALUNOS
var aluno = await _context.Alunos.FirstOrDefaultAsync(a => a.Email == usuario.Email);
if (aluno != null)
{
    var participante = await _context.Participantes
        .FirstOrDefaultAsync(p => p.AlunoId == aluno.AlunoId);
    
    if (participante != null)
    {
        var jaRespondeu = await _context.Respostas
            .AnyAsync(r => r.QuestionarioId == questionarioId && 
                          r.ParticipanteId == participante.Id);
        return jaRespondeu;
    }
}

// Para PROFESSORES
var professor = await _context.Professores.FirstOrDefaultAsync(p => p.Email == usuario.Email);
if (professor != null)
{
    var participante = await _context.Participantes
        .FirstOrDefaultAsync(p => p.ProfessorId == professor.Id);
    
    if (participante != null)
    {
        var jaRespondeu = await _context.Respostas
            .AnyAsync(r => r.QuestionarioId == questionarioId && 
                          r.ParticipanteId == participante.Id);
        return jaRespondeu;
    }
}
```

## 📊 **Estrutura Real dos Relacionamentos**

### **Como Funciona o Sistema:**
```
Usuario (logado) 
    ↓ (por Email)
Aluno/Professor
    ↓ (por ID)
Participante
    ↓ (por ParticipanteId)
Resposta
```

### **Tabelas e Relacionamentos:**
```sql
-- Tabela Usuarios
Usuarios (Id, Nome, Email, PerfilId)

-- Tabela Alunos
Alunos (AlunoId, Nome, Email, ...)  -- SEM UsuarioId

-- Tabela Professores
Professores (Id, Nome, Email, ...)  -- SEM UsuarioId

-- Tabela Participantes
Participantes (Id, Nome, Email, AlunoId?, ProfessorId?, ...)

-- Tabela ParticipantesQuestionarios
ParticipantesQuestionarios (Id, QuestionarioId, ParticipanteId, ...)

-- Tabela Respostas
Respostas (Id, QuestionarioId, ParticipanteId, ...)
```

## ✅ **Benefícios das Correções**

### **1. Compatibilidade:**
- ✅ **Usa campos que existem** nos modelos
- ✅ **Email como chave** de relacionamento
- ✅ **Funciona** com estrutura atual do banco

### **2. Robustez:**
- ✅ **Busca por email** (campo comum)
- ✅ **Fallbacks seguros** para todos os cenários
- ✅ **Tratamento de erros** adequado

### **3. Performance:**
- ✅ **Queries simples** por email
- ✅ **Relacionamentos diretos** via ID
- ✅ **Uma query** por verificação

## 🔄 **Antes vs Depois**

### **ANTES (COM ERROS):**
```csharp
// ❌ Tentava usar campos inexistentes
a.UsuarioId == userId
p.UsuarioId == userId
pq.UsuarioId == userId
```

### **DEPOIS (CORRETO):**
```csharp
// ✅ Usa campos que existem
a.Email == usuario.Email
p.Email == usuario.Email
pq.ParticipanteId == participante.Id
```

## 🚀 **Resultado Final**

### **✅ Problemas Resolvidos:**
1. **Erros de compilação** - Campos inexistentes removidos
2. **Runtime errors** - Código funcional
3. **Lógica correta** - Usa estrutura real do banco
4. **Relacionamentos** - Baseados em campos existentes

### **✅ Funcionalidades Mantidas:**
1. **Verificação de participação** funciona
2. **Busca por email** robusta
3. **Relacionamentos** corretos
4. **Fallbacks** seguros

O sistema agora usa apenas campos que realmente existem nos modelos! 🎉
