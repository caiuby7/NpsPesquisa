-- Script para verificar se o usuário admin foi criado
USE ava_inst;

-- Verificar perfis
SELECT * FROM perfis;

-- Verificar usuários
SELECT * FROM usuarios;

-- Verificar se o usuário admin existe
SELECT u.*, p.Nome as PerfilNome 
FROM usuarios u 
JOIN perfis p ON u.PerfilId = p.Id 
WHERE u.Email = 'admin@nps.com';
