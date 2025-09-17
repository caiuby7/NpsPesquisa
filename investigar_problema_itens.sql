-- SQL para investigar por que TipoItemAvaliado e NomeItemAvaliado estão NULL
-- Execute este script no seu banco de dados MySQL

USE ava_inst;

-- 1. Verificar se existem dados na tabela itensavaliadosquestionarios
SELECT 'Verificando tabela itensavaliadosquestionarios' AS Status;
SELECT COUNT(*) AS TotalItens FROM itensavaliadosquestionarios;
SELECT * FROM itensavaliadosquestionarios LIMIT 10;

-- 2. Verificar os ItemAvaliadoId que estão sendo usados
SELECT 'Verificando ItemAvaliadoId usados' AS Status;
SELECT DISTINCT ItemAvaliadoId FROM respostasquestoes WHERE ItemAvaliadoId IS NOT NULL;

-- 3. Verificar se existe relacionamento entre as tabelas
SELECT 'Verificando relacionamento' AS Status;
SELECT 
    rq.ItemAvaliadoId,
    ia.Id AS IdNaTabelaItens,
    ia.nomeItemEspecifico,
    ia.tipoItemAvaliado
FROM respostasquestoes rq
LEFT JOIN itensavaliadosquestionarios ia ON rq.ItemAvaliadoId = ia.Id
WHERE rq.ItemAvaliadoId IS NOT NULL
LIMIT 10;

-- 4. Verificar se os ItemAvaliadoId existem na tabela itensavaliadosquestionarios
SELECT 'Verificando existência dos IDs' AS Status;
SELECT 
    rq.ItemAvaliadoId,
    CASE 
        WHEN ia.Id IS NULL THEN 'NÃO EXISTE'
        ELSE 'EXISTE'
    END AS Status,
    ia.nomeItemEspecifico,
    ia.tipoItemAvaliado
FROM respostasquestoes rq
LEFT JOIN itensavaliadosquestionarios ia ON rq.ItemAvaliadoId = ia.Id
WHERE rq.ItemAvaliadoId IS NOT NULL
GROUP BY rq.ItemAvaliadoId, ia.Id, ia.nomeItemEspecifico, ia.tipoItemAvaliado;

-- 5. Verificar estrutura da tabela itensavaliadosquestionarios
SELECT 'Estrutura da tabela itensavaliadosquestionarios' AS Status;
DESCRIBE itensavaliadosquestionarios;

-- 6. Verificar se há dados na tabela respostas com informações de itens
SELECT 'Verificando tabela respostas' AS Status;
SELECT 
    r.Id,
    r.QuestionarioId,
    r.ParticipanteId,
    r.DataResposta,
    r.TipoItemAvaliado,
    r.NomeItemEspecifico,
    r.ItemAvaliadoId
FROM respostas r
WHERE r.Id IN (SELECT DISTINCT RespostaId FROM respostasquestoes WHERE ItemAvaliadoId IS NOT NULL)
LIMIT 5;
