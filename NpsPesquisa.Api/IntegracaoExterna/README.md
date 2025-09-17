# Integração TOTVS - NPS Pesquisa

Este módulo implementa a integração com o sistema TOTVS para sincronização de dados de alunos e professores.

## Estrutura do Módulo

### Models
- **TotvsAluno.cs** - Modelo para dados de alunos vindos da view V_ALUNOS
- **TotvsProfessor.cs** - Modelo para dados de professores vindos da view V_PROFESSORES

### Services
- **ITotvsService.cs** - Interface do serviço de integração
- **TotvsService.cs** - Implementação do serviço de integração

### Controllers
- **TotvsController.cs** - Endpoints REST para integração

## Configuração

### appsettings.json
```json
{
  "Totvs": {
    "ConnectionString": "Data Source=(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=200.135.232.1)(PORT=1521))(CONNECT_DATA=(SID=ORAUNERJ)));User Id=rm;Password=collinsgem;Connection Timeout=120;",
    "Enabled": true,
    "SyncIntervalMinutes": 60
  }
}
```

## Endpoints Disponíveis

### Alunos
- `GET /api/totvs/alunos` - Busca todos os alunos
- `GET /api/totvs/alunos/{ra}` - Busca aluno por RA
- `GET /api/totvs/alunos/periodo/{periodoLetivo}` - Busca alunos por período
- `GET /api/totvs/alunos/curso/{codigoCurso}` - Busca alunos por curso

### Professores
- `GET /api/totvs/professores` - Busca todos os professores
- `GET /api/totvs/professores/{login}` - Busca professor por login
- `GET /api/totvs/professores/periodo/{periodoLetivo}` - Busca professores por período
- `GET /api/totvs/professores/curso/{codigoCurso}` - Busca professores por curso

### Sincronização
- `POST /api/totvs/sincronizar/alunos?periodoLetivo={periodo}` - Sincroniza alunos
- `POST /api/totvs/sincronizar/professores?periodoLetivo={periodo}` - Sincroniza professores
- `POST /api/totvs/sincronizar/todos?periodoLetivo={periodo}` - Sincroniza todos os dados

### Relatórios
- `GET /api/totvs/relatorio/sincronizacao?periodoLetivo={periodo}` - Relatório de sincronização

## Views TOTVS Utilizadas

### V_ALUNOS
Campos mapeados:
- PERIODO_LETIVO, NIVEL_ENSINO, CODFILIAL, FILIAL_NOME
- CODIGO_PESSOA, RA, NOME, CPF, NASCIMENTO_ALUNO
- EMAIL, EMAIL_PESSOAL, SEXO, DT_NASC
- COD_STATUS_NA_DISCIPLINA, STATUS_NA_DISCIPLINA
- TIPO_MATRICULA, DATA_MATRICULA, IDTURMADISC
- CODIGO_DISCIPLINA, CODTURMA, COD_CURSO_DA_TURMA
- CURSO_DA_TURMA, FASE, NOME_DISCIPLINA, TIPO_TURMA
- STATUS_NO_PERIODO_LETIVO, COD_CURSO_DO_ALUNO
- CURSO_DO_ALUNO, FILIAL, GRADE_DO_ALUNO
- HABILITACAO_DO_ALUNO, INGRESSO_NO_CURSO
- TURNO_POLO, TURMA_ATIVA

### V_PROFESSORES
Campos mapeados:
- PERIODO_LETIVO, COD_FILIAL, FILIAL_NOME, NIVEL_ENSINO
- COD_CURSO, HAB, MATRIZ, CURSO, COD_TURMA
- TURMA_GERENCIAL, IDTURMADISC, IDTURMADISCGERENCIADA
- COD_DISC, DISCIPLINA, TURNO_POLO, SEXO
- PROFESSOR, TIPO_PROF_TURMA, TURMA_ATIVA
- TIPO_TURMA, LOGIN, EMAIL, COORDENADORATUAL, PROF_ATIVO

## Processo de Sincronização

1. **Busca dados do TOTVS** - Executa queries nas views V_ALUNOS e V_PROFESSORES
2. **Cria/Atualiza Instituições** - Baseado nos dados de filial
3. **Cria/Atualiza Cursos** - Baseado nos dados de curso
4. **Cria/Atualiza Turmas** - Baseado nos dados de turma
5. **Cria/Atualiza Alunos/Professores** - Com todos os campos mapeados
6. **Cria/Atualiza Participantes** - Para uso no sistema de avaliação

## Mapeamento de Campos

### Alunos
- RA → RA (RA e Matrícula são a mesma coisa)
- NOME → Nome
- EMAIL/EMAIL_PESSOAL → Email/EmailPessoal
- CPF → Cpf
- DT_NASC/NASCIMENTO_ALUNO → DataNascimento
- SEXO → Sexo (M/F → Masculino/Feminino)
- CURSO_DO_ALUNO → CursoId (via busca/criação)
- CODTURMA → TurmaId (via busca/criação)
- FASE → Fase
- GRADE_DO_ALUNO → Grade
- HABILITACAO_DO_ALUNO → Habilitacao
- INGRESSO_NO_CURSO → DataIngressoCurso
- DATA_MATRICULA → DataMatricula
- STATUS_NO_PERIODO_LETIVO → StatusNoPeriodoLetivo
- TURMA_ATIVA → TurmaAtiva (S/N → true/false)

### Professores
- PROFESSOR → Nome
- EMAIL → Email
- LOGIN → Login
- SEXO → Sexo (M/F → Masculino/Feminino)
- COD_FILIAL → InstituicaoId (via busca/criação)
- PROF_ATIVO → Ativo (S/N → true/false)

## Logs e Monitoramento

O serviço registra logs detalhados para:
- Operações de busca no TOTVS
- Processo de sincronização
- Erros de integração
- Estatísticas de sincronização

## Tratamento de Erros

- Conexão com TOTVS falha → Log de erro + exceção
- Dados inválidos → Log de warning + continua processamento
- Falha na criação de entidades → Log de erro + rollback da transação
- Timeout de conexão → Retry automático (configurável)

## Performance

- Conexões Oracle são abertas e fechadas por operação
- Transações são usadas para garantir consistência
- Índices são criados nos campos de integração
- Queries são otimizadas com parâmetros específicos

## Segurança

- Conexão com TOTVS usa credenciais configuradas
- Endpoints requerem autenticação JWT
- Logs não expõem dados sensíveis
- Validação de entrada em todos os endpoints
