using Microsoft.AspNetCore.Http;
using System.Net;
using System.Text.Json;

namespace NpsPesquisa.Api.Middleware
{
    public class ErrorHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ErrorHandlingMiddleware> _logger;

        public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            _logger.LogError(exception, "Erro não tratado capturado pelo middleware");

            var response = context.Response;
            response.ContentType = "application/json";

            var errorResponse = new
            {
                message = "Ocorreu um erro interno no servidor",
                details = exception.Message,
                timestamp = DateTime.UtcNow
            };

            switch (exception)
            {
                case System.Net.Sockets.SocketException socketEx:
                    response.StatusCode = (int)HttpStatusCode.ServiceUnavailable;
                    errorResponse = new
                    {
                        message = "Erro de conectividade com serviço externo",
                        details = $"Não foi possível conectar ao servidor. Código do erro: {socketEx.SocketErrorCode}",
                        timestamp = DateTime.UtcNow
                    };
                    break;

                case Oracle.ManagedDataAccess.Client.OracleException oracleEx:
                    response.StatusCode = (int)HttpStatusCode.ServiceUnavailable;
                    errorResponse = new
                    {
                        message = "Erro de conexão com banco de dados Oracle",
                        details = $"Código Oracle: {oracleEx.Number} - {oracleEx.Message}",
                        timestamp = DateTime.UtcNow
                    };
                    break;

                case InvalidOperationException invalidOpEx:
                    response.StatusCode = (int)HttpStatusCode.BadRequest;
                    errorResponse = new
                    {
                        message = "Operação inválida",
                        details = invalidOpEx.Message,
                        timestamp = DateTime.UtcNow
                    };
                    break;

                default:
                    response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    break;
            }

            var jsonResponse = JsonSerializer.Serialize(errorResponse, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            await response.WriteAsync(jsonResponse);
        }
    }
}
