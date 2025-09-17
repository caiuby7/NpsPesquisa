using System.Net;

namespace NpsPesquisa.Api.Configuration
{
    public static class NetworkConfiguration
    {
        public static void ConfigureNetworkSettings()
        {
            // Configurar timeouts para conexões de rede
            ServicePointManager.DefaultConnectionLimit = 200;
            ServicePointManager.Expect100Continue = false;
            ServicePointManager.UseNagleAlgorithm = false;
            
            // Configurar timeouts específicos
            ServicePointManager.DnsRefreshTimeout = 120000; // 2 minutos
            ServicePointManager.MaxServicePointIdleTime = 300000; // 5 minutos
            
            // Configurar TLS/SSL
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12 | SecurityProtocolType.Tls13;
            
            // Configurar certificados SSL
            ServicePointManager.ServerCertificateValidationCallback = 
                (sender, certificate, chain, sslPolicyErrors) => true;
        }
    }
}
