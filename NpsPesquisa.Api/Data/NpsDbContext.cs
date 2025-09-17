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
        public DbSet<Professor> Professores { get; set; }
        public DbSet<Coordenador> Coordenadores { get; set; }
        public DbSet<Turma> Turmas { get; set; }
        public DbSet<Disciplina> Disciplinas { get; set; }
        public DbSet<TurmaDisciplina> TurmasDisciplinas { get; set; }
        public DbSet<CoordenadorCurso> CoordenadoresCursos { get; set; }
        public DbSet<Participante> Participantes { get; set; }
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
        public DbSet<ItemAvaliadoQuestionario> ItensAvaliadosQuestionarios { get; set; }
        public DbSet<Instituicao> Instituicoes { get; set; }
        public DbSet<PeriodoLetivo> PeriodosLetivos { get; set; }
        public DbSet<TurmaDisciplina> TurmaDisciplinas { get; set; }
        // public DbSet<ResultadoHistoricoCsc> ResultadosHistoricosCsc { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuração global para nomes de tabelas em minúsculo
            modelBuilder.Entity<Curso>().ToTable("cursos");
            modelBuilder.Entity<Aluno>().ToTable("alunos");
            modelBuilder.Entity<Professor>().ToTable("professores");
            modelBuilder.Entity<Coordenador>().ToTable("coordenadores");
            modelBuilder.Entity<Turma>().ToTable("turmas");
            modelBuilder.Entity<Disciplina>().ToTable("disciplinas");
            modelBuilder.Entity<TurmaDisciplina>().ToTable("turmasdisciplinas");
            modelBuilder.Entity<CoordenadorCurso>().ToTable("coordenadorescursos");
            modelBuilder.Entity<Participante>().ToTable("participantes");
            modelBuilder.Entity<Questionario>().ToTable("questionarios");
            modelBuilder.Entity<Questao>().ToTable("questoes");
            modelBuilder.Entity<QuestaoQuestionario>().ToTable("questoesquestionarios");
            modelBuilder.Entity<OpcaoQuestao>().ToTable("opcoesquestao");
            modelBuilder.Entity<Resposta>().ToTable("respostas");
            modelBuilder.Entity<RespostaQuestao>().ToTable("respostasquestoes");
            modelBuilder.Entity<Perfil>().ToTable("perfis");
            modelBuilder.Entity<Usuario>().ToTable("usuarios");
            modelBuilder.Entity<ConviteQuestionario>().ToTable("convitesquestionarios");
            modelBuilder.Entity<ParticipanteQuestionario>().ToTable("participantesquestionarios");
            modelBuilder.Entity<ItemAvaliadoQuestionario>().ToTable("itensavaliadosquestionarios");
            modelBuilder.Entity<Instituicao>().ToTable("instituicoes");
            modelBuilder.Entity<PeriodoLetivo>().ToTable("periodosletivos");

            // Configuração do Usuario
            modelBuilder.Entity<Usuario>(entity =>
            {
                entity.HasOne(u => u.Perfil)
                    .WithMany(p => p.Usuarios)
                    .HasForeignKey(u => u.PerfilId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configuração do Aluno
            modelBuilder.Entity<Aluno>()
                .HasOne(a => a.Curso)
                .WithMany(c => c.Alunos)
                .HasForeignKey(a => a.CursoId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Aluno>()
                .HasOne(a => a.Turma)
                .WithMany(t => t.Alunos)
                .HasForeignKey(a => a.TurmaId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configuração do Curso
            modelBuilder.Entity<Curso>()
                .HasOne(c => c.Instituicao)
                .WithMany(i => i.Cursos)
                .HasForeignKey(c => c.InstituicaoId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configuração da Turma
            modelBuilder.Entity<Turma>()
                .HasOne(t => t.Curso)
                .WithMany(c => c.Turmas)
                .HasForeignKey(t => t.CursoId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configuração da Disciplina
            modelBuilder.Entity<Disciplina>()
                .HasOne(d => d.Instituicao)
                .WithMany(i => i.Disciplinas)
                .HasForeignKey(d => d.InstituicaoId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configuração da TurmaDisciplina
            modelBuilder.Entity<TurmaDisciplina>()
                .HasOne(td => td.Turma)
                .WithMany(t => t.TurmasDisciplinas)
                .HasForeignKey(td => td.TurmaId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TurmaDisciplina>()
                .HasOne(td => td.Disciplina)
                .WithMany(d => d.TurmasDisciplinas)
                .HasForeignKey(td => td.DisciplinaId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TurmaDisciplina>()
                .HasOne(td => td.Professor)
                .WithMany(p => p.TurmasDisciplinas)
                .HasForeignKey(td => td.ProfessorId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configuração da CoordenadorCurso
            modelBuilder.Entity<CoordenadorCurso>()
                .HasOne(cc => cc.Coordenador)
                .WithMany(c => c.Coordenacoes)
                .HasForeignKey(cc => cc.CoordenadorId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CoordenadorCurso>()
                .HasOne(cc => cc.Curso)
                .WithMany(c => c.Coordenacoes)
                .HasForeignKey(cc => cc.CursoId)
                .OnDelete(DeleteBehavior.Restrict);

            // Índice único para evitar coordenações duplicadas ativas
            modelBuilder.Entity<CoordenadorCurso>()
                .HasIndex(cc => new { cc.CoordenadorId, cc.CursoId, cc.Ativo })
                .IsUnique();

            // Configuração do Questionário
            modelBuilder.Entity<Questionario>()
                .HasMany(q => q.QuestoesQuestionarios)
                .WithOne(qq => qq.Questionario)
                .HasForeignKey(qq => qq.QuestionarioId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configuração do campo Tipo do Questionário
            modelBuilder.Entity<Questionario>()
                .Property(q => q.Tipo)
                .HasDefaultValue(TipoQuestionario.NPS);

            // Configuração do campo PermitirComentarios do Questionário
            modelBuilder.Entity<Questionario>()
                .Property(q => q.PermitirComentarios)
                .HasDefaultValue(false);

            // Configuração do campo PermitirSalvarAndamento do Questionário
            modelBuilder.Entity<Questionario>()
                .Property(q => q.PermitirSalvarAndamento)
                .HasDefaultValue(false);

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
                .HasOne(r => r.Participante)
                .WithMany(p => p.Respostas)
                .HasForeignKey(r => r.ParticipanteId)
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

            // Configuração de índice único para permitir múltiplas respostas para a mesma questão
            // com diferentes itens avaliados (ItemAvaliadoId)
            modelBuilder.Entity<RespostaQuestao>()
                .HasIndex(rq => new { rq.RespostaId, rq.QuestaoId, rq.ItemAvaliadoId })
                .IsUnique();

            // Configuração do ConviteQuestionario
            modelBuilder.Entity<ConviteQuestionario>()
                .HasOne(cq => cq.Questionario)
                .WithMany()
                .HasForeignKey(cq => cq.QuestionarioId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ConviteQuestionario>()
                .HasOne(cq => cq.Participante)
                .WithMany()
                .HasForeignKey(cq => cq.ParticipanteId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ConviteQuestionario>()
                .HasIndex(cq => cq.Chave)
                .IsUnique();

            // Configurações para RespostaQuestao com campos desnormalizados
            modelBuilder.Entity<RespostaQuestao>(entity =>
            {
                // Índices para performance
                entity.HasIndex(e => e.CursoId);
                entity.HasIndex(e => e.TurmaId);
                entity.HasIndex(e => e.DisciplinaId);
                entity.HasIndex(e => e.ProfessorId);
                entity.HasIndex(e => e.InstituicaoId);
                entity.HasIndex(e => e.ItemAvaliadoId);
                
                // Relacionamentos opcionais para os campos desnormalizados
                entity.HasOne(e => e.Curso)
                    .WithMany()
                    .HasForeignKey(e => e.CursoId)
                    .OnDelete(DeleteBehavior.SetNull);
                    
                entity.HasOne(e => e.Turma)
                    .WithMany()
                    .HasForeignKey(e => e.TurmaId)
                    .OnDelete(DeleteBehavior.SetNull);
                    
                entity.HasOne(e => e.Disciplina)
                    .WithMany()
                    .HasForeignKey(e => e.DisciplinaId)
                    .OnDelete(DeleteBehavior.SetNull);
                    
                entity.HasOne(e => e.Professor)
                    .WithMany()
                    .HasForeignKey(e => e.ProfessorId)
                    .OnDelete(DeleteBehavior.SetNull);
                    
                entity.HasOne(e => e.Instituicao)
                    .WithMany()
                    .HasForeignKey(e => e.InstituicaoId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // Configuração do ItemAvaliadoQuestionario
            modelBuilder.Entity<ItemAvaliadoQuestionario>()
                .HasOne(iaq => iaq.Questionario)
                .WithMany(q => q.ItensAvaliados)
                .HasForeignKey(iaq => iaq.QuestionarioId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configuração do ParticipanteQuestionario
            modelBuilder.Entity<ParticipanteQuestionario>()
                .HasOne(pq => pq.Questionario)
                .WithMany(q => q.Participantes)
                .HasForeignKey(pq => pq.QuestionarioId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ParticipanteQuestionario>()
                .HasOne(pq => pq.Participante)
                .WithMany(p => p.Participacoes)
                .HasForeignKey(pq => pq.ParticipanteId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configuração dos relacionamentos de contexto
            modelBuilder.Entity<ParticipanteQuestionario>()
                .HasOne(pq => pq.Curso)
                .WithMany()
                .HasForeignKey(pq => pq.CursoId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<ParticipanteQuestionario>()
                .HasOne(pq => pq.Turma)
                .WithMany()
                .HasForeignKey(pq => pq.TurmaId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<ParticipanteQuestionario>()
                .HasOne(pq => pq.Disciplina)
                .WithMany()
                .HasForeignKey(pq => pq.DisciplinaId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<ParticipanteQuestionario>()
                .HasOne(pq => pq.Professor)
                .WithMany()
                .HasForeignKey(pq => pq.ProfessorId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<ParticipanteQuestionario>()
                .HasOne(pq => pq.Instituicao)
                .WithMany()
                .HasForeignKey(pq => pq.InstituicaoId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<ParticipanteQuestionario>()
                .HasOne(pq => pq.PeriodoLetivo)
                .WithMany()
                .HasForeignKey(pq => pq.PeriodoLetivoId)
                .OnDelete(DeleteBehavior.SetNull);

            // Configuração do relacionamento do Participante com Coordenador
            modelBuilder.Entity<Participante>()
                .HasOne(p => p.Coordenador)
                .WithMany()
                .HasForeignKey(p => p.CoordenadorId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
} 