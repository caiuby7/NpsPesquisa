-- SQL para ver quem respondeu e qual tipo de item foi avaliado
-- Execute este script no seu banco de dados MySQL

USE ava_inst;

-- Consulta principal com informações completas
SELECT
    rq.Id AS RespostaQuestaoId,
    rq.RespostaId,
    rq.QuestaoId,
    q.Texto AS TextoQuestao,
    rq.Valor AS RespostaValor,
    rq.Texto AS RespostaTexto,
    rq.ItemAvaliadoId,
    
    -- Informações do participante que respondeu
    p.Nome AS NomeParticipante,
    p.Email AS EmailParticipante,
    p.Tipo AS TipoParticipante,
    
    -- Informações do item avaliado
    ia.nomeItemEspecifico AS NomeItemAvaliado,
    ia.tipoItemAvaliado AS TipoItemAvaliado,
    ia.descricaoItem AS DescricaoItem,
    
    -- Detalhes específicos baseado no tipo de item
    CASE 
        WHEN ia.tipoItemAvaliado = 'Curso' THEN c.Nome
        WHEN ia.tipoItemAvaliado = 'Turma' THEN t.Nome
        WHEN ia.tipoItemAvaliado = 'Disciplina' THEN d.Nome
        WHEN ia.tipoItemAvaliado = 'Professor' THEN prof.Nome
        WHEN ia.tipoItemAvaliado = 'Coordenador' THEN coord.Nome
        ELSE ia.nomeItemEspecifico
    END AS NomeDetalhadoItem,
    
    -- Data da resposta
    r.DataResposta,
    
    -- Informações do questionário
    quest.Titulo AS TituloQuestionario
    
FROM
    respostasquestoes AS rq
LEFT JOIN
    respostas AS r ON rq.RespostaId = r.Id
LEFT JOIN
    participantes AS p ON r.ParticipanteId = p.Id
LEFT JOIN
    questoes AS q ON rq.QuestaoId = q.Id
LEFT JOIN
    questionarios AS quest ON r.QuestionarioId = quest.Id
LEFT JOIN
    itensavaliadosquestionarios AS ia ON rq.ItemAvaliadoId = ia.Id
LEFT JOIN
    cursos AS c ON ia.cursoId = c.Id
LEFT JOIN
    turmas AS t ON ia.turmaId = t.Id
LEFT JOIN
    disciplinas AS d ON ia.disciplinaId = d.Id
LEFT JOIN
    professores AS prof ON ia.professorId = prof.Id
LEFT JOIN
    coordenadores AS coord ON ia.coordenadorId = coord.Id
WHERE
    rq.ItemAvaliadoId IS NOT NULL
ORDER BY
    r.DataResposta DESC, rq.RespostaId, rq.QuestaoId;

-- Resumo por tipo de item avaliado
SELECT
    ia.tipoItemAvaliado AS TipoItemAvaliado,
    COUNT(*) AS TotalRespostas,
    COUNT(DISTINCT rq.RespostaId) AS TotalQuestionarios,
    COUNT(DISTINCT p.Id) AS TotalParticipantes,
    GROUP_CONCAT(DISTINCT ia.nomeItemEspecifico ORDER BY ia.nomeItemEspecifico SEPARATOR ', ') AS ItensAvaliados
FROM
    respostasquestoes AS rq
LEFT JOIN
    respostas AS r ON rq.RespostaId = r.Id
LEFT JOIN
    participantes AS p ON r.ParticipanteId = p.Id
LEFT JOIN
    itensavaliadosquestionarios AS ia ON rq.ItemAvaliadoId = ia.Id
WHERE
    rq.ItemAvaliadoId IS NOT NULL
GROUP BY
    ia.tipoItemAvaliado
ORDER BY
    TotalRespostas DESC;

-- Resumo por participante
SELECT
    p.Nome AS NomeParticipante,
    p.Tipo AS TipoParticipante,
    COUNT(DISTINCT rq.RespostaId) AS TotalQuestionariosRespondidos,
    COUNT(rq.Id) AS TotalRespostas,
    COUNT(DISTINCT ia.tipoItemAvaliado) AS TiposItensAvaliados,
    GROUP_CONCAT(DISTINCT ia.tipoItemAvaliado ORDER BY ia.tipoItemAvaliado SEPARATOR ', ') AS TiposItens
FROM
    respostasquestoes AS rq
LEFT JOIN
    respostas AS r ON rq.RespostaId = r.Id
LEFT JOIN
    participantes AS p ON r.ParticipanteId = p.Id
LEFT JOIN
    itensavaliadosquestionarios AS ia ON rq.ItemAvaliadoId = ia.Id
WHERE
    rq.ItemAvaliadoId IS NOT NULL
GROUP BY
    p.Id, p.Nome, p.Tipo
ORDER BY
    TotalRespostas DESC;
