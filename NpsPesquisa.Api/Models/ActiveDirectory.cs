using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Text;
using System.DirectoryServices;

namespace NpsPesquisa.Api.Models
{
    public class ActiveDirectory
    {
        public static DirectoryEntry AcessoAd()
        {
            DirectoryEntry de = new DirectoryEntry("LDAP://DC=catolicasc,DC=org,DC=br", "ldapportal", "ldapportal*");
            return de;
        }


        public static IList<Usuario> Consultausuario(string usuario)
        {
            IList<Usuario> usua = new List<Usuario>();
            Usuario u = new Usuario();
            DirectoryEntry Acesso = AcessoAd();
            DirectorySearcher pesquisa = new DirectorySearcher();
            pesquisa.SearchRoot = Acesso;
            pesquisa.SearchScope = SearchScope.Subtree;
            pesquisa.Filter = "(ObjectClass=user)";
            foreach (SearchResult filtro in pesquisa.FindAll())
            {

                u.Nome = filtro.Properties["cn"][0].ToString();
                usua.Add(u);
            }

            return usua;
        }
        
        
        public static bool IsAuthenticated(string username, string pwd)
        {
            string msg = "";
            if (!string.IsNullOrWhiteSpace(username) && !string.IsNullOrWhiteSpace(pwd))
            {
                try
                {
                    //TESTE
                    //DirectoryEntry directoryEntry = new DirectoryEntry("LDAP://177.52.222.16", username, pwd);
                    //PRODUÇÃO
                    DirectoryEntry directoryEntry = new DirectoryEntry("LDAP://192.168.40.10", username, pwd);
                    DirectorySearcher directorySearcher = new DirectorySearcher(directoryEntry);
                    directorySearcher.Filter = "(sAMAccountName=" + username + ")";
                    SearchResult searchResult = directorySearcher.FindOne();
                    if ((Int32)searchResult.Properties["userAccountControl"][0] == 544)
                    {
                        msg = "Usuário Autenticado!";

                        return true;
                    }
                    else
                    {
                        msg = "ERRO: Usuário/Senha Inválido!";
                        return false;
                    }
                }
                catch (Exception ex)
                {
                    var msdg = ex;
                    return false;
                }
            }

            return false;
        }

        public static InfoPerfil ConsultaPerfil(string username, string pwd)
        {
            InfoPerfil info = new InfoPerfil();
            info.perfil = "";
            if (!string.IsNullOrWhiteSpace(username) && !string.IsNullOrWhiteSpace(pwd))
            {

                try
                {
                    //TESTE
                    //DirectoryEntry directoryEntry = new DirectoryEntry("LDAP://177.52.222.16", username, pwd);
                    //PRODUÇÃO
                    DirectoryEntry directoryEntry = new DirectoryEntry("LDAP://DC=catolicasc,DC=org,DC=br", username, pwd);
                    DirectorySearcher directorySearcher = new DirectorySearcher(directoryEntry);
                    directorySearcher.Filter = "(sAMAccountName=" + username + ")";
                    SearchResult searchResult = directorySearcher.FindOne();

                    if ((Int32)searchResult.Properties["userAccountControl"][0] == 544)
                    {
                        info.nome = (string)searchResult.Properties["displayName"][0];
                        info.perfil = "Usuário Autenticado!";
                        if (searchResult.Path.Contains("OU=Funcionarios"))
                        {
                            info.perfil = "Funcionário";
                        }
                        if (searchResult.Path.Contains("OU=Prof"))
                        {
                            info.perfil = "Prof";
                        }
                        if (searchResult.Path.Contains("OU=Aluno"))
                        {
                            info.perfil = "Aluno";
                        }
                        if (searchResult.Path.Contains("OU=EAD"))
                        {
                            info.perfil = "Aluno";
                        }
                        return info;
                    }
                    else
                    {
                        info.perfil = "ERRO: Usuário/Senha Inválido!";
                        return info;
                    }
                }
                catch (Exception ex)
                {
                    info.perfil = ex.Message;
                    return info;
                }
            }
            return info;
        }

        public static string Coordenadores(string username, string pwd)
        {
            string domain = "177.52.222.16";
            string domainAndUsername = domain + @"\" + username;
            DirectoryEntry entry = new DirectoryEntry("LDAP://OU=catolicasc,DC=unibrasil,DC=org,DC=br",
            domainAndUsername, pwd);
            try
            {
                // Bind to the native AdsObject to force authentication.
                Object obj = entry.NativeObject;
                DirectorySearcher search = new DirectorySearcher(entry);
                search.Filter = "(SAMAccountName=" + username + ")";
                search.PropertiesToLoad.Add("cn");
                SearchResult result = search.FindOne();
                List<string> memberof = new List<string>();



                foreach (object oMember in entry.Properties["memberOf"])
                {

                    memberof.Add(oMember.ToString());

                }
                if (null == result)
                {
                    return "";
                }

            }
            catch (Exception ex)
            {
                return "";
            }
            return "Coordenação";
        }

        public static string Professores(string username, string pwd)
        {
            string domain = "catolicasc";
            string domainAndUsername = domain + @"\" + username;
            DirectoryEntry entry = new DirectoryEntry("LDAP://OU=PortalTOTVS,DC=unibrasil,DC=com,DC=br",
            domainAndUsername, pwd);
            try
            {
                // Bind to the native AdsObject to force authentication.
                Object obj = entry.NativeObject;
                DirectorySearcher search = new DirectorySearcher(entry);
                search.Filter = "(SAMAccountName=" + username + ")";
                search.PropertiesToLoad.Add("cn");
                SearchResult result = search.FindOne();
                List<string> memberof = new List<string>();



                foreach (object oMember in entry.Properties["memberOf"])
                {

                    memberof.Add(oMember.ToString());

                }
                if (null == result)
                {
                    return "";
                }

            }
            catch (Exception ex)
            {
                return "";
            }
            return "Professor";
        }
        public static bool alterarSenhaAluno(string username, string pwd, string strNovaSenha)
        {
            string domain = "catolicasc";
            string domainAndUsername = domain + @"\" + username;
            DirectoryEntry entry = new DirectoryEntry("LDAP://DC=unibrasil,DC=com,DC=br",
            domainAndUsername, pwd);


            //uEntry.AuthenticationType = AuthenticationTypes.Secure;
            DirectorySearcher search = new DirectorySearcher(entry);
            search.Filter = "(SAMAccountName=" + username + ")";
            search.PropertiesToLoad.Add("cn");
            SearchResult searchResult = search.FindOne();
            if (null == searchResult)
            {
                return false;
            }
            string _path = searchResult.Path;
            string _filterAttribute = (string)searchResult.Properties["cn"][0];
            DirectoryEntry user = searchResult.GetDirectoryEntry();
            user.Invoke("ChangePassword", new object[] { pwd, strNovaSenha });
            user.CommitChanges();
            return true;


        }
        public static bool ResetSenhaAluno(string username, string strNovaSenha)
        {
            string domain = "catolicasc";
            string useradmin = "tizerasenha";
            string domainAndUsernames = domain + @"\" + useradmin;
            DirectoryEntry Acesso = new DirectoryEntry("LDAP://DC=catolicasc,DC=org,DC=br",
            domainAndUsernames, "A$p88Jf@Xp55");

            DirectorySearcher pesquisa = new DirectorySearcher();
            pesquisa.SearchRoot = Acesso;
            pesquisa.SearchScope = SearchScope.Subtree;
            pesquisa.Filter = "(SAMAccountName=" + username + ")";
            pesquisa.PropertiesToLoad.Add("cn");


            SearchResult searchResult = pesquisa.FindOne();
            if (null == searchResult)
            {
                return false;
            }
            string _path = searchResult.Path;
            string _filterAttribute = (string)searchResult.Properties["cn"][0];
            DirectoryEntry user = searchResult.GetDirectoryEntry();
            user.Invoke("SetPassword", new object[] { strNovaSenha });
            user.CommitChanges();
            return true;


        }
        public static string Professores_POS(string username, string pwd)
        {
            string domain = "catolicasc";
            string domainAndUsername = domain + @"\" + username;
            DirectoryEntry entry = new DirectoryEntry("LDAP://OU=PortalTOTVS,DC=catolicasc,DC=org,DC=br",
            domainAndUsername, pwd);
            try
            {
                // Bind to the native AdsObject to force authentication.
                Object obj = entry.NativeObject;
                DirectorySearcher search = new DirectorySearcher(entry);
                search.Filter = "(SAMAccountName=" + username + ")";
                search.PropertiesToLoad.Add("cn");
                SearchResult result = search.FindOne();
                List<string> memberof = new List<string>();



                foreach (object oMember in entry.Properties["memberOf"])
                {

                    memberof.Add(oMember.ToString());

                }
                if (null == result)
                {
                    return "";
                }

            }
            catch (Exception ex)
            {
                return "";
            }
            return "Professor_POS";
        }

        public static string Alunos(string username, string pwd)
        {
            string domain = "catolicasc";
            string domainAndUsername = domain + @"\" + username;
            DirectoryEntry entry = new DirectoryEntry("LDAP://177.52.222.16", username, pwd);
            DirectoryEntry directoryEntry = new DirectoryEntry("LDAP://177.52.222.16", username, pwd);


            try
            {
                // Bind to the native AdsObject to force authentication.
                Object obj = entry.NativeObject;
                DirectorySearcher search = new DirectorySearcher(entry);

                search.Filter = "(SAMAccountName=" + username + ")";
                search.PropertiesToLoad.Add("cn");
                SearchResult result = search.FindOne();
                //search.Properties("pwdLastSet").Value = 0;
                result.GetDirectoryEntry().CommitChanges();
                List<string> memberof = new List<string>();



                foreach (object oMember in entry.Properties["memberOf"])
                {

                    memberof.Add(oMember.ToString());

                }
                if (null == result)
                {
                    return "";
                }

            }
            catch (Exception ex)
            {
                return "";
            }
            return "Aluno";
        }

        public static string Alunos_POS(string username, string pwd)
        {
            string domain = "unibrasil";
            string domainAndUsername = domain + @"\" + username;
            DirectoryEntry entry = new DirectoryEntry("LDAP://OU=PortalTOTVS,DC=unibrasil,DC=com,DC=br",
            domainAndUsername, pwd);
            try
            {
                // Bind to the native AdsObject to force authentication.
                Object obj = entry.NativeObject;
                DirectorySearcher search = new DirectorySearcher(entry);
                search.Filter = "(SAMAccountName=" + username + ")";
                search.PropertiesToLoad.Add("cn");
                SearchResult result = search.FindOne();
                List<string> memberof = new List<string>();



                foreach (object oMember in entry.Properties["memberOf"])
                {

                    memberof.Add(oMember.ToString());

                }
                if (null == result)
                {
                    return "";
                }

            }
            catch (Exception ex)
            {
                return "";
            }
            return "Aluno_POS";
        }
    }
}
