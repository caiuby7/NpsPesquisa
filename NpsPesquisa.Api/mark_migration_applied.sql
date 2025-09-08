-- Script para marcar a migration como aplicada
-- Execute este script diretamente no banco MySQL

-- Verificar se a tabela __EFMigrationsHistory existe
CREATE TABLE IF NOT EXISTS `__EFMigrationsHistory` (
    `MigrationId` varchar(150) CHARACTER SET utf8mb4 NOT NULL,
    `ProductVersion` varchar(32) CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK___EFMigrationsHistory` PRIMARY KEY (`MigrationId`)
) CHARACTER SET=utf8mb4;

-- Inserir o registro da migration
INSERT IGNORE INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20250818091312_InitialMigration', '8.0.0');

-- Verificar se foi inserido
SELECT * FROM `__EFMigrationsHistory`;
