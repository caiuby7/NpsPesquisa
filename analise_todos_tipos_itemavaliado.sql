-- Análise de todos os tipos de itens avaliados para desnormalização
-- Execute este script no seu banco de dados MySQL

USE ava_inst;

-- 1. Verificar todos os tipos de itens avaliados existentes
SELECT 'Tipos de itens avaliados existentes' AS Status;
SELECT DISTINCT TipoItemAvaliado, COUNT(*) AS Total
FROM questionarios 
WHERE TipoItemAvaliado IS NOT NULL
GROUP BY TipoItemAvaliado
ORDER BY TipoItemAvaliado;

-- 2. Verificar estrutura das tabelas relacionadas
SELECT 'Estrutura da tabela instituicoes' AS Status;
DESCRIBE instituicoes;

SELECT 'Estrutura da tabela cursos' AS Status;
DESCRIBE cursos;

SELECT 'Estrutura da tabela turmas' AS Status;
DESCRIBE turmas;

SELECT 'Estrutura da tabela disciplinas' AS Status;
DESCRIBE disciplinas;

SELECT 'Estrutura da tabela professores' AS Status;
DESCRIBE professores;

-- 3. Verificar dados existentes
SELECT 'Dados de instituições' AS Status;
SELECT Id, Nome FROM instituicoes LIMIT 5;

SELECT 'Dados de cursos' AS Status;
SELECT Id, Nome FROM cursos LIMIT 5;

SELECT 'Dados de turmas' AS Status;
SELECT Id, Nome FROM turmas LIMIT 5;

SELECT 'Dados de disciplinas' AS Status;
SELECT Id, Nome FROM disciplinas LIMIT 5;

SELECT 'Dados de professores' AS Status;
SELECT Id, Nome FROM professores LIMIT 5;

-- 4. Análise de mapeamento para cada tipo
SELECT 'Mapeamento de tipos para desnormalização' AS Status;

-- TipoItemAvaliado = 0 (Curso)
SELECT 'Curso: ItemAvaliadoId -> cursos.Id, NomeItemEspecifico -> cursos.Nome' AS Mapeamento;

-- TipoItemAvaliado = 1 (Turma)  
SELECT 'Turma: ItemAvaliadoId -> turmas.Id, NomeItemEspecifico -> turmas.Nome' AS Mapeamento;

-- TipoItemAvaliado = 2 (Disciplina)
SELECT 'Disciplina: ItemAvaliadoId -> disciplinas.Id, NomeItemEspecifico -> disciplinas.Nome' AS Mapeamento;

-- TipoItemAvaliado = 3 (Professor)
SELECT 'Professor: ItemAvaliadoId -> professores.Id, NomeItemEspecifico -> professores.Nome' AS Mapeamento;

-- TipoItemAvaliado = 4 (Instituição)
SELECT 'Instituição: ItemAvaliadoId -> instituicoes.Id, NomeItemEspecifico -> instituicoes.Nome' AS Mapeamento;

-- TipoItemAvaliado = 5 (Coordenador)
SELECT 'Coordenador: ItemAvaliadoId -> professores.Id, NomeItemEspecifico -> professores.Nome' AS Mapeamento;

-- TipoItemAvaliado = 6 (Estrutura)
SELECT 'Estrutura: ItemAvaliadoId -> instituicoes.Id, NomeItemEspecifico -> instituicoes.Nome' AS Mapeamento;

-- TipoItemAvaliado = 7 (Estagio)
SELECT 'Estagio: ItemAvaliadoId -> estagios.Id, NomeItemEspecifico -> estagios.Nome' AS Mapeamento;

-- TipoItemAvaliado = 8 (ProjetoExtensionista)
SELECT 'ProjetoExtensionista: ItemAvaliadoId -> projetos.Id, NomeItemEspecifico -> projetos.Nome' AS Mapeamento;

-- TipoItemAvaliado = 9 (Alunos)
SELECT 'Alunos: ItemAvaliadoId -> turmas.Id, NomeItemEspecifico -> turmas.Nome' AS Mapeamento;

-- TipoItemAvaliado = 10 (TurmaDisciplina)
SELECT 'TurmaDisciplina: ItemAvaliadoId -> turmasdisciplinas.Id, NomeItemEspecifico -> CONCAT(turma.Nome, " - ", disciplina.Nome)' AS Mapeamento;

-- TipoItemAvaliado = 11 (Infraestrutura)
SELECT 'Infraestrutura: ItemAvaliadoId -> instituicoes.Id, NomeItemEspecifico -> instituicoes.Nome' AS Mapeamento;
