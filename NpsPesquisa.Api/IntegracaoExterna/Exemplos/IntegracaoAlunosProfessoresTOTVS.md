# Integração Alunos e Professores TOTVS

## 🎯 **Visão Geral**

A integração com TOTVS para **alunos e professores** está implementada com:

- ✅ **Modelos de dados** completos para ambos
- ✅ **Serviços de sincronização** automática
- ✅ **Endpoints REST** para consultas
- ✅ **Background Service** para atualização automática
- ✅ **Campos de integração** para rastreamento

## 📊 **Estrutura de Dados**

### **👨‍🎓 Alunos (V_ALUNOS)**

**Campos principais do TOTVS:**
```sql
SELECT 
    PERIODO_LETIVO,           -- Período letivo
    CODIGO_PESSOA,            -- ID único da pessoa
    RA,                       -- Registro Acadêmico (Matrícula)
    NOME,                     -- Nome completo
    CPF,                      -- CPF
    EMAIL,                    -- Email institucional
    EMAIL_PESSOAL,            -- Email pessoal
    SEXO,                     -- Sexo
    COD_CURSO_DO_ALUNO,       -- Código do curso
    CURSO_DO_ALUNO,           -- Nome do curso
    CODTURMA,                 -- Código da turma
    NOME_DISCIPLINA,          -- Nome da disciplina
    PROFESSOR,                -- Nome do professor
    TURMA_ATIVA               -- Se a turma está ativa
FROM V_ALUNOS
```

**Mapeamento para modelo local:**
```csharp
public class Aluno
{
    // Dados básicos
    public string Nome { get; set; }
    public string Matricula { get; set; }  // RA do TOTVS
    public string Cpf { get; set; }
    public string Email { get; set; }
    public string EmailPessoal { get; set; }
    public Sexo? Sexo { get; set; }
    
    // Dados acadêmicos
    public int? CursoId { get; set; }
    public int? TurmaId { get; set; }
    public int? PeriodoLetivoId { get; set; }
    public int? InstituicaoId { get; set; }
    
    // Campos de integração TOTVS
    public string? IntegracaoId { get; set; }           // CODIGO_PESSOA
    public string? CursoIntegracaoId { get; set; }      // COD_CURSO_DO_ALUNO
    public string? TurmaIntegracaoId { get; set; }      // CODTURMA
    public string? PeriodoLetivoIntegracaoId { get; set; } // PERIODO_LETIVO
    public string? InstituicaoIntegracaoId { get; set; }   // CODFILIAL
    
    // Relacionamentos
    public virtual ICollection<TurmaDisciplina> TurmasDisciplinas { get; set; }
}
```

### **👨‍🏫 Professores (V_PROFESSORES)**

**Campos principais do TOTVS:**
```sql
SELECT 
    PERIODO_LETIVO,           -- Período letivo
    COD_FILIAL,               -- Código da filial
    FILIAL_NOME,              -- Nome da filial
    COD_CURSO,                -- Código do curso
    CURSO,                    -- Nome do curso
    COD_TURMA,                -- Código da turma
    TURMA_GERENCIAL,          -- Nome da turma
    COD_DISC,                 -- Código da disciplina
    DISCIPLINA,               -- Nome da disciplina
    PROFESSOR,                -- Nome do professor
    LOGIN,                    -- Login do professor
    EMAIL,                    -- Email do professor
    COORDENADORATUAL,         -- Se é coordenador atual
    PROF_ATIVO                -- Se o professor está ativo
FROM V_PROFESSORES
```

**Mapeamento para modelo local:**
```csharp
public class Professor
{
    // Dados básicos
    public string Nome { get; set; }
    public string Email { get; set; }
    public string? Login { get; set; }
    public string? Departamento { get; set; }
    public string? Titulacao { get; set; }
    public Sexo? Sexo { get; set; }
    
    // Campos de integração TOTVS
    public string? IntegracaoId { get; set; }           // ID do professor
    public string? CursoIntegracaoId { get; set; }      // COD_CURSO
    public string? TurmaIntegracaoId { get; set; }      // COD_TURMA
    public string? PeriodoLetivoIntegracaoId { get; set; } // PERIODO_LETIVO
    public string? InstituicaoIntegracaoId { get; set; }   // COD_FILIAL
    public string? DisciplinaIntegracaoId { get; set; }    // COD_DISC
    
    // Relacionamentos
    public virtual ICollection<TurmaDisciplina> TurmasDisciplinas { get; set; }
}
```

## 🔄 **Sincronização Automática**

### **Background Service**
```csharp
public class TotvsBackgroundService : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            // Aguardar 6 horas
            await Task.Delay(TimeSpan.FromHours(6), stoppingToken);
            
            // Sincronizar apenas se há questionários ativos
            if (await TemQuestionariosAtivos())
            {
                var periodoAtual = await ObterPeriodoLetivoAtual();
                
                // Sincronizar alunos
                var alunosSincronizados = await _totvsService.SincronizarAlunosAsync(periodoAtual);
                
                // Sincronizar professores
                var professoresSincronizados = await _totvsService.SincronizarProfessoresAsync(periodoAtual);
                
                _logger.LogInformation(
                    "Sincronização TOTVS concluída - Alunos: {Alunos}, Professores: {Professores}", 
                    alunosSincronizados, 
                    professoresSincronizados);
            }
        }
    }
}
```

### **Lógica de Sincronização**

**Para Alunos:**
1. **Buscar** dados do TOTVS (V_ALUNOS)
2. **Agrupar** por RA (um aluno pode ter múltiplas disciplinas)
3. **Criar/Atualizar** registro do aluno
4. **Associar** com turmas-disciplinas
5. **Manter** campos de integração para rastreamento

**Para Professores:**
1. **Buscar** dados do TOTVS (V_PROFESSORES)
2. **Agrupar** por LOGIN (um professor pode ter múltiplas disciplinas)
3. **Criar/Atualizar** registro do professor
4. **Associar** com turmas-disciplinas
5. **Manter** campos de integração para rastreamento

## 🎯 **Endpoints Disponíveis**

### **Alunos**
```http
GET    /api/Totvs/alunos                    # Todos os alunos
GET    /api/Totvs/alunos/{ra}               # Aluno por RA
GET    /api/Totvs/alunos/periodo/{periodo}  # Alunos por período
GET    /api/Totvs/alunos/curso/{codigo}     # Alunos por curso
POST   /api/Totvs/sincronizar/alunos        # Sincronizar alunos
```

### **Professores**
```http
GET    /api/Totvs/professores                    # Todos os professores
GET    /api/Totvs/professores/{login}            # Professor por login
GET    /api/Totvs/professores/periodo/{periodo}  # Professores por período
GET    /api/Totvs/professores/curso/{codigo}     # Professores por curso
POST   /api/Totvs/sincronizar/professores        # Sincronizar professores
```

### **Sincronização Completa**
```http
POST   /api/Totvs/sincronizar/todos              # Sincronizar tudo
GET    /api/Totvs/relatorio/sincronizacao        # Relatório de sincronização
```

## 🔍 **Filtros de Participantes**

### **Endpoint Melhorado**
```http
GET /api/Participante/disponiveis-para-questionario/{questionarioId}
    ?tipoParticipante=Aluno
    &periodoLetivo=2024/1
    &cursoId=123
    &turmaId=456
    &disciplinaId=789
    &sincronizarTOTVS=true
    &forcarSincronizacao=false
```

**Parâmetros:**
- `tipoParticipante`: Aluno, Professor, Coordenador
- `periodoLetivo`: Período letivo para filtro
- `cursoId`: ID do curso para filtro
- `turmaId`: ID da turma para filtro
- `disciplinaId`: ID da disciplina para filtro
- `sincronizarTOTVS`: Se deve sincronizar dados do TOTVS
- `forcarSincronizacao`: Se deve forçar sincronização

## 📊 **Exemplo de Uso**

### **1. Sincronização Automática**
```csharp
// Background service executa automaticamente a cada 6 horas
// Sincroniza apenas o período letivo atual
// Mantém dados sempre atualizados
```

### **2. Sincronização Sob Demanda**
```csharp
// Usuário filtra participantes com sincronização
var response = await httpClient.GetAsync(
    "/api/Participante/disponiveis-para-questionario/123?sincronizarTOTVS=true");

// Sistema sincroniza dados do TOTVS antes de filtrar
// Retorna participantes atualizados
```

### **3. Consulta Direta TOTVS**
```csharp
// Buscar aluno específico
var aluno = await httpClient.GetAsync("/api/Totvs/alunos/12345");

// Buscar professores por período
var professores = await httpClient.GetAsync("/api/Totvs/professores/periodo/2024/1");
```

## 🎯 **Benefícios da Integração**

### **✅ Para Alunos**
- **Dados atualizados** automaticamente do TOTVS
- **Múltiplas disciplinas** por aluno
- **Rastreamento completo** de matrículas
- **Filtros precisos** por curso/turma/disciplina

### **✅ Para Professores**
- **Dados atualizados** automaticamente do TOTVS
- **Múltiplas disciplinas** por professor
- **Rastreamento completo** de atuações
- **Filtros precisos** por curso/turma/disciplina

### **✅ Para o Sistema**
- **Sincronização automática** via background service
- **Sincronização sob demanda** quando necessário
- **Performance otimizada** com cache inteligente
- **Logs detalhados** para monitoramento

## 🚀 **Conclusão**

A integração de **alunos e professores** com TOTVS está **completa e funcional**, oferecendo:

- 🔄 **Sincronização automática** a cada 6 horas
- 🎯 **Sincronização sob demanda** para dados urgentes
- 📊 **Filtros precisos** por múltiplos critérios
- 🔍 **Consultas diretas** ao TOTVS
- 📈 **Monitoramento completo** via logs

**O sistema garante que os dados de alunos e professores estejam sempre atualizados e disponíveis para as avaliações!** 🎯✨
