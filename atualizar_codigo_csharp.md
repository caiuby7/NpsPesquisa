# Atualização do Código C# para Desnormalização

## 1. Atualizar o modelo Resposta

```csharp
// NpsPesquisa.Api/Models/Resposta.cs
public class Resposta
{
    public int Id { get; set; }
    public int QuestionarioId { get; set; }
    public int ParticipanteId { get; set; }
    public DateTime DataResposta { get; set; }
    
    // Campos existentes
    public TipoItemAvaliado? TipoItemAvaliado { get; set; }
    public string? NomeItemEspecifico { get; set; }
    public int? ItemAvaliadoId { get; set; }
    
    // Novos campos desnormalizados
    public int? CursoId { get; set; }
    public int? TurmaId { get; set; }
    public int? DisciplinaId { get; set; }
    public int? ProfessorId { get; set; }
    public int? InstituicaoId { get; set; }
    
    // Navegação
    public Questionario? Questionario { get; set; }
    public Participante? Participante { get; set; }
    public Curso? Curso { get; set; }
    public Turma? Turma { get; set; }
    public Disciplina? Disciplina { get; set; }
    public Professor? Professor { get; set; }
    public Instituicao? Instituicao { get; set; }
}
```

## 2. Atualizar o QuestionarioController

```csharp
// NpsPesquisa.Api/Controllers/QuestionarioController.cs
// No método ResponderQuestionario, atualizar a criação da Resposta:

var resposta = new Resposta
{
    QuestionarioId = convite.QuestionarioId,
    ParticipanteId = convite.ParticipanteId,
    DataResposta = DateTime.UtcNow,
    TipoItemAvaliado = questionario.TipoItemAvaliado,
    NomeItemEspecifico = questionario.NomeItemEspecifico,
    ItemAvaliadoId = dto.Respostas.FirstOrDefault()?.ItemAvaliadoId,
    
    // Preencher campos desnormalizados baseado no tipo
    CursoId = await GetCursoIdFromRespostas(dto.Respostas, questionario.TipoItemAvaliado),
    TurmaId = await GetTurmaIdFromRespostas(dto.Respostas, questionario.TipoItemAvaliado),
    DisciplinaId = await GetDisciplinaIdFromRespostas(dto.Respostas, questionario.TipoItemAvaliado),
    ProfessorId = await GetProfessorIdFromRespostas(dto.Respostas, questionario.TipoItemAvaliado),
    InstituicaoId = await GetInstituicaoIdFromRespostas(dto.Respostas, questionario.TipoItemAvaliado)
};
```

## 3. Adicionar métodos auxiliares

```csharp
// Métodos auxiliares para buscar IDs baseado no tipo
private async Task<int?> GetCursoIdFromRespostas(List<RespostaParaQuestionarioDto> respostas, TipoItemAvaliado? tipoItemAvaliado)
{
    if (tipoItemAvaliado != TipoItemAvaliado.Curso) return null;
    
    var itemAvaliadoId = respostas.FirstOrDefault(r => r.ItemAvaliadoId.HasValue)?.ItemAvaliadoId;
    if (!itemAvaliadoId.HasValue) return null;
    
    // Buscar curso baseado no participante
    var participanteId = respostas.FirstOrDefault()?.ParticipanteId;
    if (!participanteId.HasValue) return null;
    
    var aluno = await _context.Alunos
        .Include(a => a.Turma)
        .FirstOrDefaultAsync(a => a.ParticipanteId == participanteId.Value);
    
    return aluno?.Turma?.CursoId;
}

private async Task<int?> GetTurmaIdFromRespostas(List<RespostaParaQuestionarioDto> respostas, TipoItemAvaliado? tipoItemAvaliado)
{
    if (tipoItemAvaliado != TipoItemAvaliado.Turma && 
        tipoItemAvaliado != TipoItemAvaliado.TurmaDisciplina &&
        tipoItemAvaliado != TipoItemAvaliado.Alunos) return null;
    
    var itemAvaliadoId = respostas.FirstOrDefault(r => r.ItemAvaliadoId.HasValue)?.ItemAvaliadoId;
    if (!itemAvaliadoId.HasValue) return null;
    
    if (tipoItemAvaliado == TipoItemAvaliado.TurmaDisciplina)
    {
        var turmaDisciplina = await _context.TurmasDisciplinas
            .FirstOrDefaultAsync(td => td.Id == itemAvaliadoId.Value);
        return turmaDisciplina?.TurmaId;
    }
    
    return itemAvaliadoId.Value;
}

private async Task<int?> GetDisciplinaIdFromRespostas(List<RespostaParaQuestionarioDto> respostas, TipoItemAvaliado? tipoItemAvaliado)
{
    if (tipoItemAvaliado != TipoItemAvaliado.Disciplina && 
        tipoItemAvaliado != TipoItemAvaliado.TurmaDisciplina &&
        tipoItemAvaliado != TipoItemAvaliado.Estagio &&
        tipoItemAvaliado != TipoItemAvaliado.ProjetoExtensionista) return null;
    
    var itemAvaliadoId = respostas.FirstOrDefault(r => r.ItemAvaliadoId.HasValue)?.ItemAvaliadoId;
    if (!itemAvaliadoId.HasValue) return null;
    
    if (tipoItemAvaliado == TipoItemAvaliado.TurmaDisciplina)
    {
        var turmaDisciplina = await _context.TurmasDisciplinas
            .FirstOrDefaultAsync(td => td.Id == itemAvaliadoId.Value);
        return turmaDisciplina?.DisciplinaId;
    }
    
    return itemAvaliadoId.Value;
}

private async Task<int?> GetProfessorIdFromRespostas(List<RespostaParaQuestionarioDto> respostas, TipoItemAvaliado? tipoItemAvaliado)
{
    if (tipoItemAvaliado != TipoItemAvaliado.Professor && 
        tipoItemAvaliado != TipoItemAvaliado.Coordenador) return null;
    
    var itemAvaliadoId = respostas.FirstOrDefault(r => r.ItemAvaliadoId.HasValue)?.ItemAvaliadoId;
    if (!itemAvaliadoId.HasValue) return null;
    
    if (tipoItemAvaliado == TipoItemAvaliado.Professor)
    {
        var turmaDisciplina = await _context.TurmasDisciplinas
            .FirstOrDefaultAsync(td => td.Id == itemAvaliadoId.Value);
        return turmaDisciplina?.ProfessorId;
    }
    
    return itemAvaliadoId.Value;
}

private async Task<int?> GetInstituicaoIdFromRespostas(List<RespostaParaQuestionarioDto> respostas, TipoItemAvaliado? tipoItemAvaliado)
{
    if (tipoItemAvaliado != TipoItemAvaliado.Estrutura && 
        tipoItemAvaliado != TipoItemAvaliado.Infraestrutura) return null;
    
    var itemAvaliadoId = respostas.FirstOrDefault(r => r.ItemAvaliadoId.HasValue)?.ItemAvaliadoId;
    if (!itemAvaliadoId.HasValue) return null;
    
    return itemAvaliadoId.Value;
}
```

## 4. Atualizar o DbContext

```csharp
// NpsPesquisa.Api/Data/NpsDbContext.cs
// Adicionar configurações para as novas colunas

protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    // ... configurações existentes ...
    
    // Configurações para Resposta
    modelBuilder.Entity<Resposta>(entity =>
    {
        entity.HasIndex(e => e.CursoId);
        entity.HasIndex(e => e.TurmaId);
        entity.HasIndex(e => e.DisciplinaId);
        entity.HasIndex(e => e.ProfessorId);
        entity.HasIndex(e => e.InstituicaoId);
        entity.HasIndex(e => e.TipoItemAvaliado);
    });
}
```

## 5. Criar migration

```bash
dotnet ef migrations add AddDesnormalizacaoRespostas
dotnet ef database update
```
