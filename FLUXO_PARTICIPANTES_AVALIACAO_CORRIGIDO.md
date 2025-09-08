# 🔄 Fluxo Correto de Participantes da Avaliação

## 📋 Fluxo Implementado

Implementei o fluxo correto conforme solicitado, com três páginas distintas:

### **1. Lista de Avaliações** (`/avaliacoes`)
- **Botão**: "Adicionar Participantes"
- **Ação**: Redireciona para `/avaliacoes/{id}/participantes`

### **2. Lista de Participantes da Avaliação** (`/avaliacoes/{id}/participantes`)
- **Mostra**: Participantes já adicionados à avaliação
- **Botão**: "Adicionar Participantes" 
- **Ação**: Redireciona para `/avaliacoes/{id}/participantes/adicionar`
- **Funcionalidades**:
  - ✅ Lista participantes existentes
  - ✅ Estatísticas (Total, Responderam, Pendentes)
  - ✅ Remover participantes
  - ✅ Botão para adicionar novos

### **3. Página de Filtros e Adição** (`/avaliacoes/{id}/participantes/adicionar`)
- **Filtros**: Dinâmicos baseados no tipo de item avaliado
- **Botão**: "Pesquisar" para buscar participantes
- **Seleção**: Individual ou em massa
- **Botão**: "Adicionar X Participante(s)" para confirmar
- **Ação**: Retorna para `/avaliacoes/{id}/participantes`

## 🎯 Estrutura de Arquivos

```
form-builder/src/app/pages/avaliacoes/
├── avaliacoes.component.tsx                    # Lista de avaliações
├── participantes-avaliacao-lista.component.tsx # Lista de participantes
├── participantes-avaliacao.component.tsx       # Adicionar participantes
├── participantes-avaliacao-lista/
│   └── index.ts
└── participantes-avaliacao-adicionar/
    └── index.ts
```

## 🔗 Rotas Configuradas

```typescript
// App.tsx
<Route path="/avaliacoes" element={<AvaliacoesPage />} />
<Route path="/avaliacoes/:id/participantes" element={<ParticipantesAvaliacaoListaPage />} />
<Route path="/avaliacoes/:id/participantes/adicionar" element={<AdicionarParticipantesAvaliacaoPage />} />
```

## 🚀 Fluxo de Navegação

### **Passo 1: Lista de Avaliações**
```
/avaliacoes
├── Lista de avaliações
└── Botão "Adicionar Participantes" → /avaliacoes/{id}/participantes
```

### **Passo 2: Lista de Participantes**
```
/avaliacoes/{id}/participantes
├── Estatísticas da avaliação
├── Lista de participantes existentes
├── Botão "Adicionar Participantes" → /avaliacoes/{id}/participantes/adicionar
└── Ações para remover participantes
```

### **Passo 3: Adicionar Participantes**
```
/avaliacoes/{id}/participantes/adicionar
├── Filtros dinâmicos baseados no tipo de item avaliado
├── Botão "Pesquisar" → Busca participantes
├── Lista de participantes encontrados
├── Seleção individual ou em massa
└── Botão "Adicionar X Participante(s)" → /avaliacoes/{id}/participantes
```

## 🎨 Funcionalidades por Página

### **📋 Lista de Participantes da Avaliação**

#### **Interface**
- **Header**: Título da avaliação + Botão "Adicionar Participantes"
- **Estatísticas**: Cards com Total, Responderam, Pendentes
- **Tabela**: Lista de participantes com informações completas
- **Ações**: Remover participantes individualmente

#### **Funcionalidades**
- ✅ **Carregar participantes** já adicionados à avaliação
- ✅ **Estatísticas em tempo real** (Total, Responderam, Pendentes)
- ✅ **Remover participantes** com confirmação
- ✅ **Navegação** para adicionar novos participantes
- ✅ **Estado vazio** com call-to-action

### **➕ Adicionar Participantes**

#### **Interface**
- **Header**: Título + Botão "Voltar" para lista de participantes
- **Filtros**: Card com filtros dinâmicos baseados no tipo de item avaliado
- **Pesquisa**: Botão "Pesquisar" com loading state
- **Lista**: Tabela de participantes encontrados
- **Seleção**: Checkboxes individuais + seleção em massa
- **Ação**: Botão "Adicionar X Participante(s)"

#### **Funcionalidades**
- ✅ **Filtros dinâmicos** baseados no tipo de item avaliado
- ✅ **Pesquisa inteligente** com validação de campos
- ✅ **Seleção individual** e **em massa**
- ✅ **Validação** antes de adicionar
- ✅ **Feedback visual** com loading states e toasts
- ✅ **Navegação** de volta para lista de participantes

## 🔧 Tipos de Item Avaliado e Filtros

### **Professor**
- ✅ Instituição, Período Letivo, Curso

### **Disciplina**
- ✅ Instituição, Período Letivo, Curso

### **TurmaDisciplina**
- ✅ Instituição, Período Letivo, Curso, Turma

### **Curso**
- ✅ Instituição, Período Letivo, Curso

### **Estrutura**
- ✅ Instituição, Período Letivo

### **Coordenador**
- ✅ Instituição, Curso

### **Alunos**
- ✅ Instituição, Período Letivo, Curso, Turma

### **Turma**
- ✅ Instituição, Período Letivo, Curso, Turma

## 📊 Endpoints Utilizados

### **Lista de Participantes**
- `GET /Questionario/{id}/participantes` - Buscar participantes da avaliação
- `DELETE /Questionario/{id}/participantes/{participanteId}` - Remover participante

### **Adicionar Participantes**
- `GET /Questionario/{id}` - Dados da avaliação
- `GET /Instituicao`, `/PeriodoLetivo`, `/Curso`, etc. - Filtros
- `GET /Professor`, `/Aluno`, `/Coordenador` - Participantes
- `POST /Questionario/{id}/participantes` - Adicionar participantes

## 🎯 Benefícios do Fluxo Correto

### **✅ Experiência do Usuário**
- **Navegação intuitiva** com breadcrumbs visuais
- **Contexto claro** em cada etapa
- **Feedback visual** em todas as ações
- **Estados vazios** com call-to-action

### **✅ Funcionalidade Robusta**
- **Separação de responsabilidades** entre páginas
- **Validação completa** em cada etapa
- **Tratamento de erros** com mensagens claras
- **Loading states** para melhor UX

### **✅ Código Limpo**
- **Componentes bem estruturados** e organizados
- **TypeScript** com tipagem completa
- **Hooks personalizados** para gerenciamento de estado
- **Reutilização** de componentes e lógica

## 🚀 Como Usar

1. **Acesse** `/avaliacoes`
2. **Clique** em "Adicionar Participantes" em uma avaliação
3. **Veja** a lista de participantes já adicionados
4. **Clique** em "Adicionar Participantes" para adicionar novos
5. **Configure** os filtros baseados no tipo de item avaliado
6. **Pesquise** participantes usando os filtros
7. **Selecione** participantes individuais ou em massa
8. **Confirme** a adição dos participantes
9. **Retorne** à lista de participantes da avaliação

---

**Status**: ✅ Implementado  
**Data**: $(date)  
**Versão**: 1.0.0
