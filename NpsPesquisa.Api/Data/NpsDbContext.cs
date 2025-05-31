using Microsoft.EntityFrameworkCore;
using NpsPesquisa.Api.Models;

namespace NpsPesquisa.Api.Data
{
    public class NpsDbContext : DbContext
    {
        public NpsDbContext(DbContextOptions<NpsDbContext> options) : base(options)
        {
        }

        public DbSet<Curso> Cursos { get; set; }
        public DbSet<Aluno> Alunos { get; set; }
        public DbSet<Questionario> Questionarios { get; set; }
        public DbSet<Questao> Questoes { get; set; }
        public DbSet<QuestaoQuestionario> QuestoesQuestionarios { get; set; }
        public DbSet<OpcaoQuestao> OpcoesQuestao { get; set; }
        public DbSet<Resposta> Respostas { get; set; }
        public DbSet<RespostaQuestao> RespostasQuestoes { get; set; }
        public DbSet<Perfil> Perfis { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<ConviteQuestionario> ConvitesQuestionarios { get; set; }
        public DbSet<ParticipanteQuestionario> ParticipantesQuestionarios { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuração do Usuario
            modelBuilder.Entity<Usuario>()
                .HasOne(u => u.Perfil)
                .WithMany(p => p.Usuarios)
                .HasForeignKey(u => u.PerfilId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configuração do Aluno
            modelBuilder.Entity<Aluno>()
                .HasOne(a => a.Curso)
                .WithMany(c => c.Alunos)
                .HasForeignKey(a => a.CursoId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configuração do Questionário
            modelBuilder.Entity<Questionario>()
                .HasMany(q => q.QuestoesQuestionarios)
                .WithOne(qq => qq.Questionario)
                .HasForeignKey(qq => qq.QuestionarioId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configuração da Questão
            modelBuilder.Entity<Questao>()
                .HasMany(q => q.Opcoes)
                .WithOne(o => o.Questao)
                .HasForeignKey(o => o.QuestaoId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configuração da Questão-Questionário
            modelBuilder.Entity<QuestaoQuestionario>()
                .HasOne(qq => qq.Questao)
                .WithMany(q => q.QuestoesQuestionarios)
                .HasForeignKey(qq => qq.QuestaoId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configuração da Resposta
            modelBuilder.Entity<Resposta>()
                .HasOne(r => r.Questionario)
                .WithMany(q => q.Respostas)
                .HasForeignKey(r => r.QuestionarioId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Resposta>()
                .HasOne(r => r.Aluno)
                .WithMany(a => a.Respostas)
                .HasForeignKey(r => r.AlunoId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configuração da RespostaQuestão
            modelBuilder.Entity<RespostaQuestao>()
                .HasOne(rq => rq.Resposta)
                .WithMany(r => r.RespostasQuestoes)
                .HasForeignKey(rq => rq.RespostaId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<RespostaQuestao>()
                .HasOne(rq => rq.Questao)
                .WithMany()
                .HasForeignKey(rq => rq.QuestaoId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configuração do ConviteQuestionario
            modelBuilder.Entity<ConviteQuestionario>()
                .HasOne(cq => cq.Questionario)
                .WithMany()
                .HasForeignKey(cq => cq.QuestionarioId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ConviteQuestionario>()
                .HasOne(cq => cq.Aluno)
                .WithMany()
                .HasForeignKey(cq => cq.AlunoId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ConviteQuestionario>()
                .HasIndex(cq => cq.Chave)
                .IsUnique();
        }
    }
} 