# 👥 Página de Participantes da Avaliação

## 📋 Funcionalidade Implementada

Criada uma nova página dedicada para listar e gerenciar participantes de avaliações com filtros dinâmicos baseados no tipo de item avaliado.

## 🎯 Características Principais

### **1. Filtros Dinâmicos**
- **Filtros baseados no tipo de item avaliado**
- **Interface adaptativa** que mostra apenas os filtros relevantes
- **Validação de campos** obrigatórios

### **2. Tipos de Item Avaliado e Filtros**

#### **Professor**
- ✅ Instituição, Período Letivo, Curso

#### **Disciplina**
- ✅ Instituição, Período Letivo, Curso

#### **TurmaDisciplina**
- ✅ Instituição, Período Letivo, Curso, Turma

#### **Curso**
- ✅ Instituição, Período Letivo, Curso

#### **Estrutura**
- ✅ Instituição, Período Letivo

#### **Coordenador**
- ✅ Instituição, Curso

#### **Alunos**
- ✅ Instituição, Período Letivo, Curso, Turma

#### **Turma**
- ✅ Instituição, Período Letivo, Curso, Turma

### **3. Funcionalidades da Interface**

#### **🔍 Pesquisa de Participantes**
- **Botão "Pesquisar"** executa a busca baseada nos filtros
- **Loading state** durante a pesquisa
- **Feedback visual** com contagem de resultados

#### **📋 Lista de Participantes**
- **Tabela responsiva** com informações dos participantes
- **Checkbox** para seleção individual
- **Botões de seleção em massa** (Selecionar Todos / Deselecionar Todos)
- **Contador de participantes** selecionados

#### **➕ Adicionar Participantes**
- **Botão de adicionar** com contagem de selecionados
- **Validação** para garantir que pelo menos um participante seja selecionado
- **Integração com API** para vincular participantes à avaliação

## 🔧 Implementação Técnica

### **Arquivo Principal**
```
form-builder/src/app/pages/avaliacoes/participantes-avaliacao.component.tsx
```

### **Rota de Acesso**
```
/avaliacoes/{id}/participantes
```

### **Navegação Atualizada**
- **Botão "Adicionar Participantes"** na listagem de avaliações
- **Redirecionamento** para a nova página de participantes
- **Botão "Voltar"** para retornar à listagem

### **Integração com Backend**

#### **Endpoints Utilizados**
- `GET /Questionario/{id}` - Buscar dados da avaliação
- `GET /Instituicao` - Listar instituições
- `GET /PeriodoLetivo` - Listar períodos letivos
- `GET /Curso` - Listar cursos
- `GET /Turma` - Listar turmas
- `GET /Disciplina` - Listar disciplinas
- `GET /Professor` - Listar professores
- `GET /Coordenador` - Listar coordenadores
- `GET /Aluno` - Listar alunos
- `POST /Questionario/{id}/participantes` - Adicionar participantes

#### **Lógica de Filtros**
```typescript
const getFiltrosVisiveis = () => {
  const filtrosVisiveis: string[] = [];
  
  switch (avaliacao.tipoItemAvaliado) {
    case 'Professor':
    case 'Disciplina':
    case 'TurmaDisciplina':
    case 'Curso':
      filtrosVisiveis.push('instituicao', 'periodoLetivo', 'curso');
      if (avaliacao.tipoItemAvaliado === 'TurmaDisciplina') {
        filtrosVisiveis.push('turma');
      }
      break;
    // ... outros casos
  }
  
  return filtrosVisiveis;
};
```

## 🎨 Interface do Usuário

### **1. Header da Página**
- **Botão "Voltar"** para retornar à listagem
- **Título da página** e nome da avaliação
- **Navegação clara** e intuitiva

### **2. Seção de Filtros**
- **Card com filtros** organizados em grid responsivo
- **Campos dinâmicos** baseados no tipo de item avaliado
- **Botão "Pesquisar"** com loading state

### **3. Lista de Participantes**
- **Tabela responsiva** com scroll horizontal
- **Checkboxes** para seleção individual
- **Informações organizadas**: Nome, Email, Tipo, Curso, Turma, Instituição
- **Botões de seleção em massa**

### **4. Ações**
- **Botão "Adicionar Participantes"** com contagem
- **Validação visual** quando nenhum participante está selecionado
- **Feedback de sucesso** após adicionar participantes

## 🚀 Fluxo de Uso

### **1. Acessar a Página**
1. Ir para `/avaliacoes`
2. Clicar em "Adicionar Participantes" em uma avaliação
3. Ser redirecionado para `/avaliacoes/{id}/participantes`

### **2. Filtrar Participantes**
1. **Preencher filtros** baseados no tipo de item avaliado
2. **Clicar em "Pesquisar"** para buscar participantes
3. **Aguardar carregamento** dos resultados

### **3. Selecionar Participantes**
1. **Selecionar individualmente** usando checkboxes
2. **Ou usar seleção em massa** (Selecionar Todos / Deselecionar Todos)
3. **Verificar contagem** de participantes selecionados

### **4. Adicionar à Avaliação**
1. **Clicar em "Adicionar X Participante(s)"**
2. **Aguardar confirmação** de sucesso
3. **Ser redirecionado** para a listagem de avaliações

## 📊 Benefícios

### **✅ Experiência do Usuário**
- **Interface intuitiva** e fácil de usar
- **Filtros dinâmicos** baseados no contexto
- **Feedback visual** claro em todas as ações
- **Navegação fluida** entre páginas

### **✅ Funcionalidade Robusta**
- **Validação de dados** em todas as etapas
- **Tratamento de erros** com mensagens claras
- **Loading states** para melhor UX
- **Integração completa** com backend

### **✅ Código Limpo**
- **Componente bem estruturado** e organizado
- **TypeScript** com tipagem completa
- **Hooks personalizados** para gerenciamento de estado
- **Separação de responsabilidades** clara

## 🎯 Próximos Passos

### **Melhorias Futuras**
- [ ] **Paginação** para listas grandes de participantes
- [ ] **Busca por texto** além dos filtros
- [ ] **Exportação** de lista de participantes
- [ ] **Histórico** de participantes adicionados
- [ ] **Validação de duplicatas** antes de adicionar

---

**Status**: ✅ Implementado  
**Data**: $(date)  
**Versão**: 1.0.0
