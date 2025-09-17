# Scripts de Atualização do Banco de Dados

Este diretório contém scripts para atualizar o banco de dados MySQL para suportar a integração com TOTVS.

## Arquivos

### 1. AtualizarBancoParaIntegracaoTotvs.sql
Script principal que aplica todas as alterações necessárias:
- Adiciona campos de contexto nas tabelas `participantesquestionarios` e `respostasquestoes`
- Cria índices para performance
- Adiciona foreign keys para relacionamentos
- **Nota**: A coluna `Matricula` permanece no banco; `RA` é uma propriedade `[NotMapped]` no modelo C#

### 2. RollbackIntegracaoTotvs.sql
Script de rollback que reverte todas as alterações:
- Remove campos de contexto adicionados
- Remove índices e foreign keys criados
- **Nota**: A coluna `Matricula` permanece inalterada no banco

### 3. ExecutarAtualizacaoBanco.ps1
Script PowerShell para facilitar a execução dos scripts SQL.

## Como Usar

### Opção 1: Executar diretamente no MySQL

```bash
# Aplicar alterações
mysql -h [host] -u [user] -p[password] [database] < AtualizarBancoParaIntegracaoTotvs.sql

# Reverter alterações (se necessário)
mysql -h [host] -u [user] -p[password] [database] < RollbackIntegracaoTotvs.sql
```

### Opção 2: Usar o script PowerShell

```powershell
# Aplicar alterações
.\ExecutarAtualizacaoBanco.ps1 -ConnectionString "Server=localhost;Database=ava_inst;User Id=root;Password=senha"

# Reverter alterações
.\ExecutarAtualizacaoBanco.ps1 -ConnectionString "Server=localhost;Database=ava_inst;User Id=root;Password=senha" -Rollback

# Modo what-if (apenas mostrar o que seria executado)
.\ExecutarAtualizacaoBanco.ps1 -ConnectionString "Server=localhost;Database=ava_inst;User Id=root;Password=senha" -WhatIf
```

### Opção 3: Usar Entity Framework Migrations

```bash
# Aplicar migração
dotnet ef database update

# Reverter migração
dotnet ef database update [migration_anterior]
```

## Alterações Aplicadas

### Tabela `alunos`
- **Nenhuma alteração**: A coluna `Matricula` permanece no banco
- A propriedade `RA` no modelo C# é `[NotMapped]` e retorna o valor de `Matricula`

### Tabela `participantesquestionarios`
- Adiciona campos de contexto:
  - `CursoId` (INT, NULL)
  - `TurmaId` (INT, NULL)
  - `DisciplinaId` (INT, NULL)
  - `ProfessorId` (INT, NULL)
  - `InstituicaoId` (INT, NULL)
  - `PeriodoLetivoId` (INT, NULL)
  - `TipoItemAvaliado` (INT, NULL)
  - `NomeItemEspecifico` (VARCHAR(200), NULL)
  - `ItemAvaliadoId` (INT, NULL)

### Tabela `respostasquestoes`
- Adiciona campos de contexto:
  - `CursoId` (INT, NULL)
  - `TurmaId` (INT, NULL)
  - `DisciplinaId` (INT, NULL)
  - `ProfessorId` (INT, NULL)
  - `InstituicaoId` (INT, NULL)
  - `ItemAvaliadoId` (INT, NULL)

### Tabelas `turmas` e `instituicoes`
- Adiciona campo `Codigo` (TEXT, NULL)

## Índices Criados

### participantesquestionarios
- `IX_participantesquestionarios_CursoId`
- `IX_participantesquestionarios_TurmaId`
- `IX_participantesquestionarios_DisciplinaId`
- `IX_participantesquestionarios_ProfessorId`
- `IX_participantesquestionarios_InstituicaoId`
- `IX_participantesquestionarios_PeriodoLetivoId`

### respostasquestoes
- `IX_respostasquestoes_CursoId`
- `IX_respostasquestoes_TurmaId`
- `IX_respostasquestoes_DisciplinaId`
- `IX_respostasquestoes_ProfessorId`
- `IX_respostasquestoes_InstituicaoId`
- `IX_respostasquestoes_ItemAvaliadoId`
- `IX_respostasquestoes_RespostaId_QuestaoId_ItemAvaliadoId` (único)

## Foreign Keys Adicionadas

Todas as foreign keys são criadas com `ON DELETE SET NULL` para manter a integridade referencial.

## Verificação

Os scripts incluem comandos de verificação que mostram:
- Se as colunas foram criadas/renomeadas corretamente
- Se os índices foram criados
- Status geral da execução

## Importante

⚠️ **BACKUP**: Sempre faça backup do banco de dados antes de executar os scripts.

⚠️ **TESTE**: Teste primeiro em ambiente de desenvolvimento.

⚠️ **ROLLBACK**: Mantenha o script de rollback disponível caso precise reverter as alterações.
