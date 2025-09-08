-- Script para criar dados iniciais no banco ava_inst
USE ava_inst;

-- 1. Inserir perfis básicos
INSERT INTO perfis (Nome, Descricao) VALUES 
('Administrador', 'Acesso total ao sistema'),
('Coordenacao', 'Acesso à gestão de questionários e alunos'),
('Participante', 'Acesso apenas para responder questionários');

-- 2. Inserir usuário administrador
-- Senha: Admin@123 (hash MD5: YWRtaW5AMTIz)
INSERT INTO usuarios (Nome, Email, Senha, Ativo, DataCriacao, PerfilId) VALUES 
('Administrador', 'admin@nps.com', 'YWRtaW5AMTIz', 1, NOW(), 
 (SELECT Id FROM perfis WHERE Nome = 'Administrador' LIMIT 1));

-- 3. Inserir alguns cursos de exemplo
INSERT INTO cursos (Nome, Descricao, Codigo, CargaHorariaTotal, CreditosTotal, DuracaoSemestres, Ativo, DataCriacao, DataAtualizacao) VALUES 
('Direito', 'Curso de Direito', 'DIR001', 3600, 180, 10, 1, NOW(), NOW()),
('Administração', 'Curso de Administração', 'ADM001', 3200, 160, 8, 1, NOW(), NOW()),
('Engenharia Civil', 'Curso de Engenharia Civil', 'ENG001', 4000, 200, 10, 1, NOW(), NOW());

-- 4. Inserir algumas turmas de exemplo
INSERT INTO turmas (Nome, Descricao, CursoId, Ano, Semestre, Periodo, Ativo, DataCriacao) VALUES 
('Turma A - Direito 2024.1', 'Primeira turma de Direito 2024.1', 1, 2024, 1, 1, 1, NOW()),
('Turma B - Direito 2024.1', 'Segunda turma de Direito 2024.1', 1, 2024, 1, 2, 1, NOW()),
('Turma A - Administração 2024.1', 'Turma de Administração 2024.1', 2, 2024, 1, 1, 1, NOW());

-- 5. Inserir algumas disciplinas de exemplo
INSERT INTO disciplinas (Nome, Descricao, Codigo, CargaHoraria, Creditos, Ativo, DataCriacao) VALUES 
('Introdução ao Direito', 'Disciplina introdutória ao Direito', 'DIR101', 60, 4, 1, NOW()),
('Direito Constitucional', 'Fundamentos do Direito Constitucional', 'DIR102', 80, 5, 1, NOW()),
('Matemática Financeira', 'Matemática aplicada à administração', 'ADM101', 60, 4, 1, NOW()),
('Gestão de Pessoas', 'Administração de recursos humanos', 'ADM102', 80, 5, 1, NOW());

-- 6. Inserir alguns professores de exemplo
INSERT INTO professores (Nome, Email, Departamento, Titulacao, Telefone, Cpf, Ativo, DataCadastro, DataAtualizacao) VALUES 
('Dr. João Silva', 'joao.silva@instituicao.com', 'Direito', 'Doutor', '(11) 99999-9999', '123.456.789-00', 1, NOW(), NOW()),
('Dra. Maria Santos', 'maria.santos@instituicao.com', 'Administração', 'Doutora', '(11) 88888-8888', '987.654.321-00', 1, NOW(), NOW()),
('Prof. Carlos Oliveira', 'carlos.oliveira@instituicao.com', 'Engenharia', 'Mestre', '(11) 77777-7777', '456.789.123-00', 1, NOW(), NOW());

-- 7. Inserir alguns alunos de exemplo
INSERT INTO alunos (Filial, NivelEnsino, PeriodoLetivo, Nome, Matricula, Email, CursoId, TurmaId, Turno, EmailInstitucional, EmailPessoal, Fone, StatusNoPeriodoLetivo, AceitaContato, Ativo, DataCadastro, DataAtualizacao) VALUES 
('São Paulo', 'Graduação', '2024.1', 'Ana Costa', '2024001', 'ana.costa@aluno.instituicao.com', 1, 1, 'Matutino', 'ana.costa@aluno.instituicao.com', 'ana.costa@gmail.com', '(11) 66666-6666', 'Ativo', 1, 1, NOW(), NOW()),
('São Paulo', 'Graduação', '2024.1', 'Pedro Lima', '2024002', 'pedro.lima@aluno.instituicao.com', 1, 1, 'Matutino', 'pedro.lima@aluno.instituicao.com', 'pedro.lima@gmail.com', '(11) 55555-5555', 'Ativo', 1, 1, NOW(), NOW()),
('São Paulo', 'Graduação', '2024.1', 'Juliana Ferreira', '2024003', 'juliana.ferreira@aluno.instituicao.com', 2, 3, 'Noturno', 'juliana.ferreira@aluno.instituicao.com', 'juliana.ferreira@gmail.com', '(11) 44444-4444', 'Ativo', 1, 1, NOW(), NOW());

-- 8. Inserir alguns coordenadores de exemplo
INSERT INTO coordenadores (Nome, Email, Departamento, Titulacao, Telefone, Cpf, Ativo, DataCadastro, DataAtualizacao) VALUES 
('Dr. Roberto Almeida', 'roberto.almeida@instituicao.com', 'Direito', 'Doutor', '(11) 33333-3333', '111.222.333-44', 1, NOW(), NOW()),
('Dra. Fernanda Costa', 'fernanda.costa@instituicao.com', 'Administração', 'Doutora', '(11) 22222-2222', '555.666.777-88', 1, NOW(), NOW());

-- 9. Vincular coordenadores aos cursos
INSERT INTO coordenadorescursos (CoordenadorId, CursoId, DataInicio, DataFim, Observacao, Ativo, DataCadastro, DataAtualizacao) VALUES 
(1, 1, NOW(), NULL, 'Coordenador do curso de Direito', 1, NOW(), NOW()),
(2, 2, NOW(), NULL, 'Coordenadora do curso de Administração', 1, NOW(), NOW());

-- 10. Inserir participantes de exemplo
INSERT INTO participantes (Nome, Email, Tipo, Ativo, CursoId, Matricula, Semestre, Departamento, Titulacao, Setor, Cargo, Telefone, Cpf, DataCadastro, DataAtualizacao, AlunoId, ProfessorId, CoordenadorId) VALUES 
-- Alunos como participantes
('Ana Costa', 'ana.costa@aluno.instituicao.com', 0, 1, 1, '2024001', 1, NULL, NULL, NULL, NULL, '(11) 66666-6666', '123.456.789-01', NOW(), NOW(), 1, NULL, NULL),
('Pedro Lima', 'pedro.lima@aluno.instituicao.com', 0, 1, 1, '2024002', 1, NULL, NULL, NULL, NULL, '(11) 55555-5555', '123.456.789-02', NOW(), NOW(), 2, NULL, NULL),
('Juliana Ferreira', 'juliana.ferreira@aluno.instituicao.com', 0, 1, 2, '2024003', 1, NULL, NULL, NULL, NULL, '(11) 44444-4444', '123.456.789-03', NOW(), NOW(), 3, NULL, NULL),
-- Professores como participantes
('Dr. João Silva', 'joao.silva@instituicao.com', 1, 1, NULL, NULL, NULL, 'Direito', 'Doutor', 'Acadêmico', 'Professor', '(11) 99999-9999', '123.456.789-00', NOW(), NOW(), NULL, 1, NULL),
('Dra. Maria Santos', 'maria.santos@instituicao.com', 1, 1, NULL, NULL, NULL, 'Administração', 'Doutora', 'Acadêmico', 'Professora', '(11) 88888-8888', '987.654.321-00', NOW(), NOW(), NULL, 2, NULL),
-- Coordenadores como participantes
('Dr. Roberto Almeida', 'roberto.almeida@instituicao.com', 3, 1, NULL, NULL, NULL, 'Direito', 'Doutor', 'Acadêmico', 'Coordenador', '(11) 33333-3333', '111.222.333-44', NOW(), NOW(), NULL, NULL, 1),
('Dra. Fernanda Costa', 'fernanda.costa@instituicao.com', 3, 1, NULL, NULL, NULL, 'Administração', 'Doutora', 'Acadêmico', 'Coordenadora', '(11) 22222-2222', '555.666.777-88', NOW(), NOW(), NULL, NULL, 2);

-- Verificar os dados inseridos
SELECT 'Perfis criados:' as Info;
SELECT * FROM perfis;

SELECT 'Usuário admin criado:' as Info;
SELECT u.*, p.Nome as PerfilNome 
FROM usuarios u 
JOIN perfis p ON u.PerfilId = p.Id 
WHERE u.Email = 'admin@nps.com';

SELECT 'Cursos criados:' as Info;
SELECT * FROM cursos;

SELECT 'Participantes criados:' as Info;
SELECT p.*, 
       CASE p.Tipo 
           WHEN 0 THEN 'Aluno'
           WHEN 1 THEN 'Professor' 
           WHEN 2 THEN 'Funcionário'
           WHEN 3 THEN 'Coordenador'
       END as TipoDescricao
FROM participantes p;
