# Análise Completa dos Tipos de Itens Avaliados

## Tipos de Itens Avaliados (Enum):

| ID | Nome | Descrição | Tabela de Referência | Campo Nome |
|----|------|-----------|---------------------|------------|
| 0 | Curso | Aluno avalia seu curso | `cursos` | `cursos.Nome` |
| 1 | Turma | Aluno avalia sua turma | `turmas` | `turmas.Nome` |
| 2 | Disciplina | Aluno avalia disciplinas que cursa | `disciplinas` | `disciplinas.Nome` |
| 3 | Professor | Professor se autoavalia | `professores` | `professores.Nome` |
| 4 | Coordenador | Aluno avalia coordenador do curso | `professores` | `professores.Nome` |
| 5 | Estagio | Aluno avalia estágio curricular | `estagios` | `estagios.Nome` |
| 6 | ProjetoExtensionista | Aluno avalia projeto extensionista | `projetos` | `projetos.Nome` |
| 7 | Estrutura | Aluno avalia estrutura física | `instituicoes` | `instituicoes.Nome` |
| 8 | Alunos | Professor avalia alunos da turma | `turmas` | `turmas.Nome` |
| 9 | TurmaDisciplina | Aluno avalia professor+disciplina+turma | `turmasdisciplinas` | `CONCAT(turma.Nome, " - ", disciplina.Nome)` |
| 10 | Infraestrutura | Avaliação geral de infraestrutura | `instituicoes` | `instituicoes.Nome` |

## Análise para Desnormalização:

### ✅ **Tipos que funcionam bem com desnormalização simples:**
- **Curso** → `NomeCurso`
- **Turma** → `NomeTurma` 
- **Disciplina** → `NomeDisciplina`
- **Professor** → `NomeProfessor`
- **Coordenador** → `NomeProfessor` (mesmo campo)
- **Estrutura** → `NomeInstituicao`
- **Infraestrutura** → `NomeInstituicao` (mesmo campo)

### ⚠️ **Tipos que precisam de campos específicos:**
- **TurmaDisciplina** → `NomeTurma` + `NomeDisciplina` (já temos)
- **Alunos** → `NomeTurma` (já temos)
- **Estagio** → `NomeEstagio` (novo campo)
- **ProjetoExtensionista** → `NomeProjeto` (novo campo)

## Estrutura Proposta para Tabela `respostas`:

```sql
ALTER TABLE respostas ADD COLUMN NomeCurso VARCHAR(200);
ALTER TABLE respostas ADD COLUMN NomeTurma VARCHAR(200);
ALTER TABLE respostas ADD COLUMN NomeDisciplina VARCHAR(200);
ALTER TABLE respostas ADD COLUMN NomeProfessor VARCHAR(200);
ALTER TABLE respostas ADD COLUMN NomeInstituicao VARCHAR(200);
ALTER TABLE respostas ADD COLUMN NomeEstagio VARCHAR(200);
ALTER TABLE respostas ADD COLUMN NomeProjeto VARCHAR(200);
```

## Relatórios Possíveis:

### 1. **Por Curso:**
```sql
SELECT NomeCurso, COUNT(*) FROM respostas WHERE NomeCurso IS NOT NULL GROUP BY NomeCurso;
```

### 2. **Por Turma:**
```sql
SELECT NomeTurma, COUNT(*) FROM respostas WHERE NomeTurma IS NOT NULL GROUP BY NomeTurma;
```

### 3. **Por Disciplina:**
```sql
SELECT NomeDisciplina, COUNT(*) FROM respostas WHERE NomeDisciplina IS NOT NULL GROUP BY NomeDisciplina;
```

### 4. **Por Professor:**
```sql
SELECT NomeProfessor, COUNT(*) FROM respostas WHERE NomeProfessor IS NOT NULL GROUP BY NomeProfessor;
```

### 5. **Por Instituição:**
```sql
SELECT NomeInstituicao, COUNT(*) FROM respostas WHERE NomeInstituicao IS NOT NULL GROUP BY NomeInstituicao;
```

## Conclusão:

✅ **A Opção 1 (desnormalização) ATENDE todos os tipos de itens avaliados!**

- **7 campos** cobrem todos os casos
- **Relatórios simples** e rápidos
- **Sem JOINs complexos**
- **Performance excelente**
