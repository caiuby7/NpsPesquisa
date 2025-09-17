# Exemplos de Uso - Integração TOTVS

## 1. Buscar Alunos

### Buscar todos os alunos
```http
GET /api/totvs/alunos
Authorization: Bearer {token}
```

### Buscar aluno específico por RA
```http
GET /api/totvs/alunos/123456
Authorization: Bearer {token}
```

### Buscar alunos por período letivo
```http
GET /api/totvs/alunos/periodo/2024.1
Authorization: Bearer {token}
```

### Buscar alunos por curso
```http
GET /api/totvs/alunos/curso/001
Authorization: Bearer {token}
```

## 2. Buscar Professores

### Buscar todos os professores
```http
GET /api/totvs/professores
Authorization: Bearer {token}
```

### Buscar professor por login
```http
GET /api/totvs/professores/prof.joao
Authorization: Bearer {token}
```

### Buscar professores por período letivo
```http
GET /api/totvs/professores/periodo/2024.1
Authorization: Bearer {token}
```

### Buscar professores por curso
```http
GET /api/totvs/professores/curso/001
Authorization: Bearer {token}
```

## 3. Sincronização

### Sincronizar todos os alunos
```http
POST /api/totvs/sincronizar/alunos
Authorization: Bearer {token}
```

### Sincronizar alunos de um período específico
```http
POST /api/totvs/sincronizar/alunos?periodoLetivo=2024.1
Authorization: Bearer {token}
```

### Sincronizar todos os professores
```http
POST /api/totvs/sincronizar/professores
Authorization: Bearer {token}
```

### Sincronizar todos os dados
```http
POST /api/totvs/sincronizar/todos
Authorization: Bearer {token}
```

## 4. Relatórios

### Gerar relatório de sincronização
```http
GET /api/totvs/relatorio/sincronizacao
Authorization: Bearer {token}
```

### Gerar relatório para período específico
```http
GET /api/totvs/relatorio/sincronizacao?periodoLetivo=2024.1
Authorization: Bearer {token}
```

## 5. Exemplos de Resposta

### Resposta de Aluno
```json
{
  "ra": "123456",
  "matricula": "123456",
  "nome": "João Silva",
  "email": "joao.silva@email.com",
  "cpf": "123.456.789-00",
  "dataNascimento": "1995-05-15T00:00:00",
  "sexo": "M",
  "cursoDoAluno": "Engenharia de Software",
  "codCursoDoAluno": "001",
  "turmaAtiva": "S",
  "periodoLetivo": "2024.1",
  "fase": "8",
  "statusNoPeriodoLetivo": "Ativo"
}
```

### Resposta de Professor
```json
{
  "login": "prof.joao",
  "professor": "João Santos",
  "email": "joao.santos@instituicao.edu.br",
  "sexo": "M",
  "curso": "Engenharia de Software",
  "codCurso": "001",
  "disciplina": "Programação I",
  "codDisc": "PROG001",
  "profAtivo": "S",
  "periodoLetivo": "2024.1"
}
```

### Resposta de Sincronização
```json
{
  "mensagem": "Sincronização de alunos concluída com sucesso",
  "registrosSincronizados": 150
}
```

### Resposta de Relatório
```json
{
  "periodoLetivo": "2024.1",
  "totalAlunos": 150,
  "totalProfessores": 25,
  "totalRegistros": 175,
  "dataGeracao": "2024-01-15T10:30:00Z",
  "alunosPorCurso": [
    {
      "curso": "Engenharia de Software",
      "quantidade": 50
    },
    {
      "curso": "Administração",
      "quantidade": 40
    }
  ],
  "professoresPorCurso": [
    {
      "curso": "Engenharia de Software",
      "quantidade": 8
    },
    {
      "curso": "Administração",
      "quantidade": 5
    }
  ]
}
```

## 6. Código C# para Uso

### Injeção de Dependência
```csharp
// No Program.cs
builder.Services.AddScoped<ITotvsService, TotvsService>();
```

### Uso no Controller
```csharp
[ApiController]
[Route("api/[controller]")]
public class MeuController : ControllerBase
{
    private readonly ITotvsService _totvsService;

    public MeuController(ITotvsService totvsService)
    {
        _totvsService = totvsService;
    }

    [HttpGet("alunos-totvs")]
    public async Task<IActionResult> BuscarAlunos()
    {
        var alunos = await _totvsService.BuscarTodosAlunosAsync();
        return Ok(alunos);
    }

    [HttpPost("sincronizar-dados")]
    public async Task<IActionResult> SincronizarDados()
    {
        var alunosSincronizados = await _totvsService.SincronizarAlunosAsync("2024.1");
        var professoresSincronizados = await _totvsService.SincronizarProfessoresAsync("2024.1");
        
        return Ok(new { 
            alunos = alunosSincronizados, 
            professores = professoresSincronizados 
        });
    }
}
```

### Uso em Background Service
```csharp
public class TotvsSyncBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<TotvsSyncBackgroundService> _logger;

    public TotvsSyncBackgroundService(IServiceProvider serviceProvider, ILogger<TotvsSyncBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var totvsService = scope.ServiceProvider.GetRequiredService<ITotvsService>();
                
                var alunosSincronizados = await totvsService.SincronizarAlunosAsync();
                var professoresSincronizados = await totvsService.SincronizarProfessoresAsync();
                
                _logger.LogInformation("Sincronização concluída: {Alunos} alunos, {Professores} professores", 
                    alunosSincronizados, professoresSincronizados);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro na sincronização automática");
            }

            await Task.Delay(TimeSpan.FromHours(1), stoppingToken); // Sincronizar a cada hora
        }
    }
}
```

## 7. Tratamento de Erros

### Erro de Conexão
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.6.1",
  "title": "Erro interno do servidor",
  "status": 500,
  "detail": "Erro ao conectar com o banco TOTVS"
}
```

### Aluno não encontrado
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404,
  "detail": "Aluno com RA 999999 não encontrado"
}
```

### Erro de validação
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Bad Request",
  "status": 400,
  "detail": "RA é obrigatório"
}
```
