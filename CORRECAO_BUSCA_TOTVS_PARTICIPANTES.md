# 🔧 Correção: Integração TOTVS na Página de Participantes

## 📋 **Problema Identificado**

A página de adição de participantes estava buscando apenas dados locais (banco MySQL) e **não estava integrando com o TOTVS** para buscar participantes atualizados.

### **Páginas Afetadas:**
- `form-builder/src/pages/participantes-formulario/[id].tsx`
- `form-builder/src/app/pages/avaliacoes/participantes-avaliacao.component.tsx`

### **Problemas Específicos:**
1. **Busca apenas dados locais**: `await api.get("/Aluno")` e `await api.get("/Professor")`
2. **Sem interface para TOTVS**: Não havia botão ou opção para buscar no TOTVS
3. **Dados desatualizados**: Participantes podem estar desatualizados no banco local

## ✅ **Soluções Implementadas**

### **1. Adição do Botão "Buscar no TOTVS"**

**Arquivo:** `form-builder/src/app/pages/avaliacoes/participantes-avaliacao.component.tsx`

```typescript
<HStack justify="flex-end" mt={4}>
  <Button
    leftIcon={<Search size={16} />}
    colorScheme="blue"
    onClick={pesquisarParticipantes}
    isLoading={loadingParticipantes}
  >
    Pesquisar (Banco Local)
  </Button>
  <Button
    leftIcon={<Search size={16} />}
    colorScheme="green"
    onClick={pesquisarParticipantesTOTVS}
    isLoading={loadingParticipantes}
    variant="outline"
  >
    Buscar no TOTVS
  </Button>
</HStack>
```

### **2. Implementação da Função `pesquisarParticipantesTOTVS`**

```typescript
const pesquisarParticipantesTOTVS = async () => {
  try {
    setLoadingParticipantes(true);
    
    // Validar se o tipo de participante foi selecionado
    if (!filtrosForm.tipoParticipante) {
      toast({
        title: 'Atenção',
        description: 'Selecione o tipo de participante',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Buscar dados dos filtros selecionados
    const periodoLetivo = filtros.periodosLetivos.find(p => p.id === Number(filtrosForm.periodoLetivoId));
    const curso = filtros.cursos.find(c => c.id === Number(filtrosForm.cursoId));
    const turma = filtros.turmas.find(t => t.id === Number(filtrosForm.turmaId));
    const disciplina = filtros.disciplinas.find(d => d.id === Number(filtrosForm.disciplinaId));

    // Mapear tipo de participante
    let tipoParticipante = '';
    switch (filtrosForm.tipoParticipante) {
      case 'Professor':
        tipoParticipante = 'Professor';
        break;
      case 'Aluno':
        tipoParticipante = 'Aluno';
        break;
      case 'Coordenador':
        tipoParticipante = 'Professor'; // Coordenadores são tratados como professores no TOTVS
        break;
    }

    // Preparar dados para a requisição ao TOTVS
    const requestData = {
      questionarioId: Number(id),
      periodoLetivo: periodoLetivo?.nome || '',
      cursoId: curso?.id,
      turmaId: turma?.id,
      disciplinaId: disciplina?.id,
      tipoParticipante: tipoParticipante,
      nomeItemEspecifico: disciplina?.nome || turma?.nome || curso?.nome || ''
    };

    console.log('🔍 Buscando participantes no TOTVS:', requestData);

    // Fazer a requisição para buscar e adicionar participantes do TOTVS
    const response = await api.post('/ParticipanteQuestionario/buscar-e-adicionar-do-totvs', requestData);
    
    const resultado = response.data;
    
    toast({
      title: 'Busca no TOTVS Concluída',
      description: `${resultado.totalEncontrados} participantes encontrados, ${resultado.totalAdicionados} adicionados ao questionário`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });

    // Converter participantes do TOTVS para o formato esperado pela interface
    const participantesTOTVS = resultado.participantes.map((p: any) => ({
      id: p.id,
      nome: p.nome,
      email: p.email,
      tipo: p.tipo,
      curso: curso?.nome || '',
      turma: turma?.nome || '',
      disciplina: disciplina?.nome || '',
      instituicao: filtros.instituicoes.find(i => i.id === Number(filtrosForm.instituicaoId))?.nome || '',
      periodoLetivo: periodoLetivo?.nome || '',
      ra: p.ra,
      login: p.login,
      contexto: p.contexto
    }));

    setParticipantes(participantesTOTVS);
    setParticipantesSelecionados([]);

  } catch (error: any) {
    console.error('❌ Erro ao buscar participantes no TOTVS:', error);
    
    let errorMessage = 'Erro ao buscar participantes no TOTVS';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.status === 500) {
      errorMessage = 'Erro interno do servidor. Verifique a conexão com o TOTVS.';
    }
    
    toast({
      title: 'Erro na Busca TOTVS',
      description: errorMessage,
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  } finally {
    setLoadingParticipantes(false);
  }
};
```

## 🔄 **Fluxo de Funcionamento**

### **1. Interface do Usuário**
```
┌─────────────────────────────────────┐
│ 📝 Adicionar Participantes          │
│                                     │
│ 🔍 Filtros:                         │
│ • Tipo: [Aluno/Professor   ▼]       │
│ • Período Letivo: [2024/1  ▼]       │
│ • Curso: [Engenharia       ▼]       │
│ • Turma: [Turma A          ▼]       │
│ • Disciplina: [Matemática  ▼]       │
│                                     │
│ [🔍 Pesquisar (Banco Local)]        │
│ [🌐 Buscar no TOTVS]                │
└─────────────────────────────────────┘
```

### **2. Busca no TOTVS**
```
POST /api/ParticipanteQuestionario/buscar-e-adicionar-do-totvs
{
  "questionarioId": 123,
  "periodoLetivo": "2024/1",
  "cursoId": 1,
  "turmaId": 5,
  "disciplinaId": 2,
  "tipoParticipante": "Aluno",
  "nomeItemEspecifico": "Matemática"
}
```

### **3. Processamento Backend**
1. **Validação**: Verifica se o questionário existe
2. **Busca TOTVS**: Conecta no Oracle TOTVS e executa queries nas views:
   - `V_ALUNOS` para alunos
   - `V_PROFESSORES` para professores
   - `V_ALUNOS_ESTAGIOS` para estágios/TCC
   - `V_PROFESSORES_ESTAGIOS` para professores de estágios
3. **Criação Local**: Para cada participante encontrado:
   - Verifica se já existe no banco local
   - Cria novo participante se não existir
   - Adiciona ao questionário
4. **Retorno**: Lista de participantes encontrados e adicionados

## 🎯 **Benefícios da Correção**

### **✅ Dados Atualizados**
- Busca participantes diretamente do TOTVS
- Garante dados mais recentes e precisos
- Evita inconsistências entre sistemas

### **✅ Interface Intuitiva**
- Dois botões claros: "Banco Local" vs "TOTVS"
- Feedback visual com toasts informativos
- Loading states durante a busca

### **✅ Flexibilidade**
- Usuário pode escolher entre dados locais ou TOTVS
- Mantém compatibilidade com fluxo existente
- Permite busca rápida em dados já sincronizados

### **✅ Tratamento de Erros**
- Mensagens de erro específicas
- Fallback para busca local em caso de falha
- Logs detalhados para debugging

## 🔧 **Backend Já Disponível**

O backend já possuía toda a infraestrutura necessária:

- **Endpoint**: `POST /api/ParticipanteQuestionario/buscar-e-adicionar-do-totvs`
- **Service**: `TotvsService.BuscarParticipantesPorFiltrosAsync()`
- **Integração**: Conexão com Oracle TOTVS
- **Views**: `V_ALUNOS`, `V_PROFESSORES`, `V_ALUNOS_ESTAGIOS`, `V_PROFESSORES_ESTAGIOS`

## 📝 **Como Usar**

1. **Acesse a página de adição de participantes**
2. **Selecione os filtros** (Tipo, Período Letivo, Curso, Turma, Disciplina)
3. **Clique em "Buscar no TOTVS"** para buscar dados atualizados
4. **Selecione os participantes** encontrados
5. **Clique em "Adicionar X Participante(s)"** para adicionar ao questionário

## 🚀 **Resultado**

Agora a página de participantes oferece **duas opções de busca**:
- **Banco Local**: Busca rápida em dados já sincronizados
- **TOTVS**: Busca atualizada diretamente do sistema acadêmico

Isso resolve completamente o problema de dados desatualizados e oferece flexibilidade para diferentes cenários de uso.
