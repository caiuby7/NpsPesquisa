# 🔧 Correções nos Filtros de Participantes

## ❌ Problemas Identificados

### **1. Requisições Desnecessárias**
- **Problema**: Estava fazendo requisições para `/api/Disciplina?instituicaoId=1&periodoLetivoId=1`
- **Causa**: Lógica de pesquisa baseada no tipo de item avaliado em vez do tipo de participante

### **2. Filtro de Tipo de Participante Ausente**
- **Problema**: Não havia campo para selecionar se é Professor ou Aluno
- **Causa**: Interface não incluía o filtro obrigatório

### **3. Lógica de Filtros Incorreta**
- **Problema**: Filtros baseados no tipo de item avaliado em vez do tipo de participante
- **Causa**: Confusão entre o que está sendo avaliado vs quem são os participantes

## ✅ Correções Implementadas

### **1. Adicionado Filtro de Tipo de Participante**

#### **Interface Atualizada**
```typescript
// Campo obrigatório sempre visível
<FormControl>
  <FormLabel>Tipo de Participante *</FormLabel>
  <Select
    value={filtrosForm.tipoParticipante}
    onChange={(e) => setFiltrosForm({...filtrosForm, tipoParticipante: e.target.value})}
    placeholder="Selecione o tipo"
  >
    <option value="Professor">Professor</option>
    <option value="Aluno">Aluno</option>
    <option value="Coordenador">Coordenador</option>
  </Select>
</FormControl>
```

#### **Valor Padrão**
```typescript
const [filtrosForm, setFiltrosForm] = useState<FiltrosFormData>({
  // ... outros campos
  tipoParticipante: 'Professor' // Default para Professor
});
```

### **2. Corrigida Lógica de Pesquisa**

#### **Antes (Incorreto)**
```typescript
// Baseado no tipo de item avaliado
switch (avaliacao?.tipoItemAvaliado) {
  case 'Professor':
    endpoint = '/Professor';
    break;
  // ...
}
```

#### **Depois (Correto)**
```typescript
// Baseado no tipo de participante selecionado
switch (filtrosForm.tipoParticipante) {
  case 'Professor':
    endpoint = '/Professor';
    break;
  case 'Aluno':
    endpoint = '/Aluno';
    break;
  case 'Coordenador':
    endpoint = '/Coordenador';
    break;
}
```

### **3. Implementada Filtragem Local**

#### **Estratégia de Filtros**
1. **Buscar todos os dados** do tipo de participante selecionado
2. **Aplicar filtros localmente** baseados nos filtros selecionados
3. **Evitar requisições desnecessárias** com parâmetros de filtro

#### **Código de Filtragem**
```typescript
// Aplicar filtros locais baseados nos filtros selecionados
let dadosFiltrados = dados;

if (filtrosForm.instituicaoId) {
  dadosFiltrados = dadosFiltrados.filter(item => 
    item.instituicao?.id === Number(filtrosForm.instituicaoId) || 
    item.instituicaoId === Number(filtrosForm.instituicaoId)
  );
}

if (filtrosForm.periodoLetivoId) {
  dadosFiltrados = dadosFiltrados.filter(item => 
    item.periodoLetivo?.id === Number(filtrosForm.periodoLetivoId) || 
    item.periodoLetivoId === Number(filtrosForm.periodoLetivoId)
  );
}
// ... outros filtros
```

### **4. Atualizada Lógica de Filtros Visíveis**

#### **Antes (Baseado no Tipo de Item Avaliado)**
```typescript
const getFiltrosVisiveis = () => {
  switch (avaliacao.tipoItemAvaliado) {
    case 'Professor':
      return ['instituicao', 'periodoLetivo', 'curso'];
    // ...
  }
};
```

#### **Depois (Baseado no Tipo de Participante)**
```typescript
const getFiltrosVisiveis = () => {
  const filtrosVisiveis: string[] = ['instituicao', 'periodoLetivo', 'curso'];
  
  switch (filtrosForm.tipoParticipante) {
    case 'Professor':
      filtrosVisiveis.push('turma', 'disciplina');
      break;
    case 'Aluno':
      filtrosVisiveis.push('turma');
      break;
    case 'Coordenador':
      // Coordenadores não precisam de turma ou disciplina
      break;
  }
  
  return filtrosVisiveis;
};
```

### **5. Validação de Tipo de Participante**

#### **Validação Obrigatória**
```typescript
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
```

## 🎯 Filtros por Tipo de Participante

### **Professor**
- ✅ **Instituição** (sempre visível)
- ✅ **Período Letivo** (sempre visível)
- ✅ **Curso** (sempre visível)
- ✅ **Turma** (visível para Professor)
- ✅ **Disciplina** (visível apenas para Professor)

### **Aluno**
- ✅ **Instituição** (sempre visível)
- ✅ **Período Letivo** (sempre visível)
- ✅ **Curso** (sempre visível)
- ✅ **Turma** (visível para Aluno)

### **Coordenador**
- ✅ **Instituição** (sempre visível)
- ✅ **Período Letivo** (sempre visível)
- ✅ **Curso** (sempre visível)

## 🔄 Fluxo de Pesquisa Corrigido

### **1. Seleção do Tipo de Participante**
- Usuário seleciona: Professor, Aluno ou Coordenador
- Interface atualiza filtros visíveis dinamicamente

### **2. Configuração dos Filtros**
- Usuário preenche filtros disponíveis para o tipo selecionado
- Filtros são opcionais (exceto tipo de participante)

### **3. Pesquisa**
- Sistema busca todos os dados do tipo selecionado
- Aplica filtros localmente nos dados retornados
- Exibe resultados filtrados

### **4. Seleção e Adição**
- Usuário seleciona participantes desejados
- Confirma adição à avaliação

## 📊 Endpoints Utilizados

### **Busca de Dados**
- `GET /Professor` - Quando tipo = "Professor"
- `GET /Aluno` - Quando tipo = "Aluno"  
- `GET /Coordenador` - Quando tipo = "Coordenador"

### **Filtros de Referência**
- `GET /Instituicao` - Lista de instituições
- `GET /PeriodoLetivo` - Lista de períodos letivos
- `GET /Curso` - Lista de cursos
- `GET /Turma` - Lista de turmas (quando necessário)
- `GET /Disciplina` - Lista de disciplinas (quando necessário)

## 🎉 Benefícios das Correções

### **✅ Performance**
- **Menos requisições** desnecessárias ao backend
- **Filtragem local** mais rápida
- **Interface responsiva** sem delays

### **✅ Usabilidade**
- **Filtro obrigatório** claro e visível
- **Filtros dinâmicos** baseados no contexto
- **Validação** antes de pesquisar

### **✅ Funcionalidade**
- **Lógica correta** de busca por tipo de participante
- **Filtros apropriados** para cada tipo
- **Validação robusta** de dados

---

**Status**: ✅ Corrigido  
**Data**: $(date)  
**Versão**: 1.1.0
