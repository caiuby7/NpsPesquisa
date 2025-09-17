using Microsoft.Extensions.Configuration;

namespace NpsPesquisa.Api.IntegracaoExterna
{
    public class Conexao
    {
        private static string? _connectionString;
        private static readonly object _lock = new object();

        public static string GetConnectionString(IConfiguration? configuration = null)
        {
            if (_connectionString == null)
            {
                lock (_lock)
                {
                    if (_connectionString == null)
                    {
                        if (configuration != null)
                        {
                            _connectionString = configuration.GetConnectionString("Totvs") 
                                ?? configuration["Totvs:ConnectionString"]
                                ?? @"Data Source=(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=200.135.232.1)(PORT=1521))(CONNECT_DATA=(SID=ORAUNERJ)));User Id=AVAL_INSTITUCIONAL;Password=F1933E88af;Connection Timeout=120;";
                        }
                        else
                        {
                            // Fallback para configuração hardcoded
                            _connectionString = @"Data Source=(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=200.135.232.1)(PORT=1521))(CONNECT_DATA=(SID=ORAUNERJ)));User Id=AVAL_INSTITUCIONAL;Password=F1933E88af;Connection Timeout=120;";
                        }
                    }
                }
            }
            return _connectionString;
        }

        public static void SetConnectionString(string connectionString)
        {
            lock (_lock)
            {
                _connectionString = connectionString;
            }
        }
    }
}
