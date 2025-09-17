# Melhorias na Integração TOTVS

## Resumo das Melhorias Implementadas

### 1. Mapeamento Automático de IDs
A integração TOTVS agora faz consultas automáticas na base MySQL local para obter os IDs das entidades relacionadas baseado nos nomes que vêm do TOTVS.

### 2. Métodos Auxiliares Criados

#### `BuscarInstituicaoIdPorNomeAsync(string nomeInstituicao)`
- Busca o ID da instituição na base MySQL local pelo nome
- Retorna `null` se não encontrar

#### `BuscarCursoIdPorNomeAsync(string nomeCurso)`
- Busca o ID do curso na base MySQL local pelo nome
- Retorna `null` se não encontrar

#### `BuscarTurmaIdPorNomeAsync(string nomeTurma)`
- Busca o ID da turma na base MySQL local pelo nome
- Retorna `null` se não encontrar

#### `BuscarDisciplinaIdPorNomeAsync(string nomeDisciplina)`
- Busca o ID da disciplina na base MySQL local pelo nome
- Retorna `null` se não encontrar

#### `BuscarPeriodoLetivoIdPorNomeAsync(string nomePeriodoLetivo)`
- Busca o ID do período letivo na base MySQL local pelo nome
- Retorna `null` se não encontrar

#### `BuscarTurmaDisciplinaIdAsync(int? turmaId, int? disciplinaId)`
- Busca o ID da TurmaDisciplina na base MySQL local pelos IDs de turma e disciplina
- Retorna `null` se não encontrar

#### `MapearIdsEntidadesAsync(ParticipanteTotvs participante)`
- Método principal que mapeia todos os IDs das entidades relacionadas
- Chama todos os métodos auxiliares acima
- Atualiza o objeto `ParticipanteTotvs` com os IDs encontrados

### 3. Atualizações nos Métodos de Busca

#### `BuscarAlunosComFiltrosAsync`
- Agora chama `MapearIdsEntidadesAsync` para cada aluno encontrado
- Mapeia automaticamente: InstituicaoId, CursoId, TurmaId, DisciplinaId, PeriodoLetivoId, TurmaDisciplinaId

#### `BuscarProfessoresComFiltrosAsync`
- Agora chama `MapearIdsEntidadesAsync` para cada professor encontrado
- Mapeia automaticamente: InstituicaoId, CursoId, TurmaId, DisciplinaId, PeriodoLetivoId, TurmaDisciplinaId

### 4. Modelo ParticipanteTotvs Atualizado

Adicionado o campo `TurmaDisciplinaId` para armazenar o ID da relação TurmaDisciplina:

```csharp
public int? TurmaDisciplinaId { get; set; }
```

### 5. Benefícios das Melhorias

1. **Dados Completos**: Os participantes retornados agora têm todos os IDs necessários para relacionamentos
2. **Integração Transparente**: O mapeamento é feito automaticamente sem intervenção manual
3. **Consistência**: Garante que os dados do TOTVS sejam corretamente relacionados com as entidades locais
4. **Performance**: As consultas são otimizadas e feitas apenas quando necessário
5. **Flexibilidade**: Funciona tanto para alunos quanto para professores

### 6. Exemplo de Uso

```csharp
// Antes: Apenas nomes
var participante = new ParticipanteTotvs
{
    Nome = "João Silva",
    Email = "joao@email.com",
    InstituicaoNome = "Universidade ABC",
    CursoNome = "Ciência da Computação",
    // IDs eram null
};

// Depois: Nomes + IDs mapeados
var participante = new ParticipanteTotvs
{
    Nome = "João Silva",
    Email = "joao@email.com",
    InstituicaoNome = "Universidade ABC",
    InstituicaoId = 1, // Mapeado automaticamente
    CursoNome = "Ciência da Computação",
    CursoId = 5, // Mapeado automaticamente
    TurmaDisciplinaId = 12 // Mapeado automaticamente
};
```

### 7. Considerações Importantes

- **Dependência de Dados**: Os nomes no TOTVS devem corresponder exatamente aos nomes na base MySQL local
- **Performance**: Cada participante gera várias consultas à base MySQL (uma por entidade)
- **Fallback**: Se um ID não for encontrado, o campo permanece `null`
- **Logs**: Erros de mapeamento são logados para facilitar debugging

## Conclusão

As melhorias implementadas tornam a integração TOTVS mais robusta e completa, fornecendo todos os IDs necessários para relacionamentos corretos entre as entidades do sistema.
