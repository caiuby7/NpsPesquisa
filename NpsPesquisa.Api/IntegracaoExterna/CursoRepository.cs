using NpsPesquisa.Api.Models;
using Oracle.ManagedDataAccess.Client;

namespace NpsPesquisa.Api.IntegracaoExterna
{
    public class CursoRepository
    {/*
        public static Aluno consultadados(string ra)
        {/*
            Aluno aluno = new Aluno();
            String myExecuteQuery = "select * from scurso WHERE lower(matricula) = :ra ";
            string connectionString = Conexao.connStringcorpore();
            using (OracleConnection connection = new OracleConnection(connectionString))
            {
                OracleCommand command = new OracleCommand(myExecuteQuery, connection);
                command.Parameters.Add(new OracleParameter(":ra", ra));
                command.Connection.Open();

                try
                {
                    OracleDataReader dados = command.ExecuteReader();
                    while (dados.Read())
                    {
                        Aluno obj = new Aluno();
                        obj.ra = dados["MATRICULA"].ToString();
                        obj.hash_celular = dados["HASHCELULAR"].ToString();
                        obj.hash_email = dados["HASHEMAIL"].ToString();
                        obj.celular = dados["CELULAR"].ToString();
                        obj.telefone = dados["RESIDENCIAL"].ToString();
                        string status_celular = dados["CELULARSTATUS"].ToString();
                        if (status_celular.Equals("0"))
                        {
                            obj.status_celular = false;
                        }
                        else
                        {
                            obj.status_celular = true;
                        }
                        string status_email = dados["EMAILSTATUS"].ToString();
                        if (status_email.Equals("0"))
                        {
                            obj.status_email = false;
                        }
                        else
                        {
                            obj.status_email = true;
                        }
                        obj.email = dados["EMAIL"].ToString();
                        aluno = obj;
                    }
                    command.Connection.Close();
                }
                catch (OracleException e)
                {
                }
            }
            return aluno;
        }*/
    }
}
