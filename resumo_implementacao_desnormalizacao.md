# Resumo da Implementação de Desnormalização

## O que foi implementado:

### 1. Modelo RespostaQuestao
- Adicionados campos desnormalizados: `CursoId`, `TurmaId`, `DisciplinaId`, `ProfessorId`, `InstituicaoId`
- Adicionadas propriedades de navegação para cada campo
- Configurados índices para performance no DbContext

### 2. QuestionarioController.cs
- Implementados métodos auxiliares para buscar IDs baseados no item avaliado:
  - `GetCursoIdFromItemAvaliado`
  - `GetTurmaIdFromItemAvaliado`
  - `GetDisciplinaIdFromItemAvaliado`
  - `GetProfessorIdFromItemAvaliado`
  - `GetInstituicaoIdFromItemAvaliado`

- Implementados métodos auxiliares para buscar IDs baseados no participante:
  - `GetCursoIdFromParticipante`
  - `GetTurmaIdFromParticipante`
  - `GetDisciplinaIdFromParticipante`
  - `GetProfessorIdFromParticipante`
  - `GetInstituicaoIdFromParticipante`

- Implementado método auxiliar para buscar InstituicaoId baseado no CursoId:
  - `GetInstituicaoIdFromCursoId`

### 3. Lógica de Preenchimento
- A lógica usa `COALESCE` (conceitualmente) para tentar primeiro o item avaliado, depois o participante
- Para `InstituicaoId`, há um terceiro fallback usando o `CursoId` já determinado
- Adicionados logs de debug para identificar onde está falhando

## Possíveis problemas identificados:

### 1. Participante.CursoId pode estar NULL
- O campo `CursoId` no modelo `Participante` pode não estar sendo preenchido corretamente
- Verificar se os participantes estão sendo criados com o `CursoId` correto

### 2. Dados de teste podem estar inconsistentes
- Verificar se existem dados válidos nas tabelas relacionadas (cursos, turmas, disciplinas, etc.)
- Verificar se os relacionamentos estão corretos

### 3. Lógica de fallback pode não estar funcionando
- Verificar se os métodos auxiliares estão retornando valores corretos
- Verificar se a lógica de `COALESCE` está funcionando como esperado

## Próximos passos para debug:

1. Executar o script `verificar_dados_simples.sql` para ver o estado atual dos dados
2. Verificar os logs de debug no console da aplicação
3. Testar com um questionário específico para ver os logs
4. Verificar se os participantes têm `CursoId` preenchido
5. Verificar se existem dados válidos nas tabelas relacionadas

## Scripts criados:
- `testar_salvamento_csharp.sql` - Script completo para verificar dados
- `verificar_dados_simples.sql` - Script simples para verificação rápida
- `migracao_desnormalizacao_respostasquestoes.sql` - Script de migração manual
