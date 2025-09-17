# 🔍 Como Funciona a Busca de Avaliações por Perfil

## 🎯 Fluxo Completo

### **1. Login do Usuário**
```typescript
// Frontend
POST /api/auth/login
{
  "email": "aluno@catolicasc.org.br",
  "password": "senha123"
}

// Resposta
{
  "token": "jwt_token_aqui",
  "nome": "João Silva",
  "email": "aluno@catolicasc.org.br",
  "perfil": "Participante"
}
```

### **2. Redirecionamento por Perfil**
```typescript
// ProfileRouter.tsx
switch (perfil) {
  case 'aluno':
  case 'participante':
    navigate('/aluno/dashboard', { replace: true });
    break;
  case 'professor':
  case 'coordenacao':
    navigate('/professor/dashboard', { replace: true });
    break;
}
```

### **3. Dashboard Carrega Avaliações**
```typescript
// Frontend - aluno-dashboard.tsx
useEffect(() => {
  const fetchAvaliacoes = async () => {
    const response = await fetch('/api/AvaliacoesDisponiveis', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    setQuestionarios(data);
  };
  
  fetchAvaliacoes();
}, [user]);
```

## 🔧 Backend - Lógica de Busca

### **4. Controller Processa Requisição**
```csharp
[HttpGet]
public async Task<ActionResult<IEnumerable<AvaliacaoDisponivelDto>>> GetAvaliacoesDisponiveis()
{
    // 1. Extrai ID do usuário do JWT
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    int userId = int.Parse(userIdClaim);
    
    // 2. Busca usuário no banco
    var usuario = await _context.Usuarios
        .Include(u => u.Perfil)
        .FirstOrDefaultAsync(u => u.Id == userId);
    
    // 3. Busca avaliações ativas
    var avaliacoesDisponiveis = await _context.Avaliacoes
        .Where(a => a.Ativa && 
                   a.DataInicio <= DateTime.Now && 
                   a.DataFim >= DateTime.Now)
        .Include(a => a.Questionario)
        .Include(a => a.ParticipantesQuestionarios)
        .ToListAsync();
}
```

### **5. Verifica Participação por Perfil**

#### **Para ALUNO/PARTICIPANTE:**
```csharp
if (perfilUsuario == "participante" || perfilUsuario == "aluno")
{
    // Verifica se a avaliação é para alunos
    if (avaliacao.TipoItemAvaliado == TipoItemAvaliado.Professor || 
        avaliacao.TipoItemAvaliado == TipoItemAvaliado.Disciplina ||
        avaliacao.TipoItemAvaliado == TipoItemAvaliado.TurmaDisciplina)
    {
        // Busca dados do aluno
        var aluno = await _context.Alunos
            .FirstOrDefaultAsync(a => a.UsuarioId == userId);
        
        // Verifica relação com item avaliado
        return await VerificarRelacaoAlunoItemAvaliado(aluno, avaliacao);
    }
}
```

#### **Para PROFESSOR/COORDENAÇÃO:**
```csharp
if (perfilUsuario == "coordenacao" || perfilUsuario == "professor")
{
    // Verifica se a avaliação é para professores
    if (avaliacao.TipoItemAvaliado == TipoItemAvaliado.Aluno ||
        avaliacao.TipoItemAvaliado == TipoItemAvaliado.Disciplina ||
        avaliacao.TipoItemAvaliado == TipoItemAvaliado.TurmaDisciplina)
    {
        // Busca dados do professor
        var professor = await _context.Professores
            .FirstOrDefaultAsync(p => p.UsuarioId == userId);
        
        // Verifica relação com item avaliado
        return await VerificarRelacaoProfessorItemAvaliado(professor, avaliacao);
    }
}
```

## 🎯 Verificação de Relações

### **Para ALUNOS - Verifica Relação com Item Avaliado:**

```csharp
private async Task<bool> VerificarRelacaoAlunoItemAvaliado(Aluno aluno, Avaliacao avaliacao)
{
    // Avaliação de professor específico
    if (avaliacao.ProfessorId.HasValue && aluno.ProfessorId == avaliacao.ProfessorId)
        return true;

    // Avaliação de disciplina específica
    if (avaliacao.DisciplinaId.HasValue && aluno.DisciplinaId == avaliacao.DisciplinaId)
        return true;

    // Avaliação de turma específica
    if (avaliacao.TurmaId.HasValue && aluno.TurmaId == avaliacao.TurmaId)
        return true;

    // Avaliação de curso específico
    if (avaliacao.CursoId.HasValue && aluno.CursoId == avaliacao.CursoId)
        return true;

    // Avaliação de período letivo
    if (avaliacao.PeriodoLetivoId.HasValue && aluno.PeriodoLetivoId == avaliacao.PeriodoLetivoId)
        return true;

    return false;
}
```

### **Para PROFESSORES - Verifica Relação com Item Avaliado:**

```csharp
private async Task<bool> VerificarRelacaoProfessorItemAvaliado(Professor professor, Avaliacao avaliacao)
{
    // Avaliação de alunos específicos
    if (avaliacao.AlunoId.HasValue)
    {
        var aluno = await _context.Alunos.FirstOrDefaultAsync(a => a.Id == avaliacao.AlunoId);
        if (aluno != null && aluno.ProfessorId == professor.Id)
            return true;
    }

    // Avaliação de disciplina que ele leciona
    if (avaliacao.DisciplinaId.HasValue)
    {
        var disciplinaProfessor = await _context.DisciplinaProfessores
            .FirstOrDefaultAsync(dp => dp.DisciplinaId == avaliacao.DisciplinaId && 
                                       dp.ProfessorId == professor.Id);
        if (disciplinaProfessor != null)
            return true;
    }

    // Avaliação de turma que ele leciona
    if (avaliacao.TurmaId.HasValue)
    {
        var turmaDisciplina = await _context.TurmaDisciplinas
            .FirstOrDefaultAsync(td => td.TurmaId == avaliacao.TurmaId && 
                                      td.ProfessorId == professor.Id);
        if (turmaDisciplina != null)
            return true;
    }

    return false;
}
```

## 📊 Exemplos Práticos

### **Exemplo 1: Aluno faz login**
```
1. Login: aluno@catolicasc.org.br
2. Sistema identifica: perfil = "Participante"
3. Redireciona para: /aluno/dashboard
4. Dashboard chama: GET /api/AvaliacoesDisponiveis
5. Sistema busca aluno no banco: Aluno { Id: 123, ProfessorId: 456, DisciplinaId: 789, ... }
6. Sistema filtra avaliações:
   - Avaliação de Professor (ID: 456) ✅ INCLUI (aluno.ProfessorId == 456)
   - Avaliação de Disciplina (ID: 789) ✅ INCLUI (aluno.DisciplinaId == 789)
   - Avaliação de Professor (ID: 999) ❌ EXCLUI (aluno.ProfessorId != 999)
7. Retorna apenas avaliações relevantes para o aluno
```

### **Exemplo 2: Professor faz login**
```
1. Login: professor@catolicasc.org.br
2. Sistema identifica: perfil = "Coordenacao"
3. Redireciona para: /professor/dashboard
4. Dashboard chama: GET /api/AvaliacoesDisponiveis
5. Sistema busca professor no banco: Professor { Id: 456, ... }
6. Sistema verifica relações:
   - DisciplinaProfessor: ProfessorId = 456, DisciplinaId = 789 ✅
   - TurmaDisciplina: ProfessorId = 456, TurmaId = 123 ✅
7. Sistema filtra avaliações:
   - Avaliação de Alunos da Disciplina 789 ✅ INCLUI
   - Avaliação de Alunos da Turma 123 ✅ INCLUI
   - Avaliação de Alunos da Disciplina 999 ❌ EXCLUI
8. Retorna apenas avaliações relevantes para o professor
```

## 🎯 Resultado Final

### **Para ALUNOS:**
- ✅ Vê avaliações de **professores** que ele tem
- ✅ Vê avaliações de **disciplinas** que ele cursa
- ✅ Vê avaliações de **turmas** que ele pertence
- ✅ Vê avaliações de **cursos** que ele está matriculado
- ✅ Vê avaliações de **período letivo** atual

### **Para PROFESSORES:**
- ✅ Vê avaliações de **alunos** que ele ensina
- ✅ Vê avaliações de **disciplinas** que ele leciona
- ✅ Vê avaliações de **turmas** que ele ministra
- ✅ Vê avaliações relacionadas ao seu trabalho

## 🔄 Fluxo Completo Resumido

```
LOGIN → IDENTIFICA PERFIL → REDIRECIONA → BUSCA AVALIAÇÕES → 
FILTRA POR RELAÇÃO → RETORNA APENAS RELEVANTES → EXIBE NO DASHBOARD
```

O sistema agora funciona de forma inteligente, mostrando apenas as avaliações que fazem sentido para cada tipo de usuário! 🎉
