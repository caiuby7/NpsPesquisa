# 🏫 Campo Instituição Adicionado ao Cadastro de Professor

## ❌ Problema Identificado

O cadastro de professor estava **faltando o campo instituição** tanto no backend quanto no frontend, impedindo a associação correta entre professores e suas respectivas instituições.

## ✅ Correções Implementadas

### **Backend (.NET 8 API)**

#### **1. Modelo Professor Atualizado**
```csharp
// NpsPesquisa.Api/Models/Professor.cs
public class Professor
{
    // ... outros campos existentes
    
    // Relacionamento com Instituição
    public int? InstituicaoId { get; set; }
    public virtual Instituicao? Instituicao { get; set; }
    
    // ... outros relacionamentos
}
```

#### **2. ProfessorViewModel Atualizado**
```csharp
// NpsPesquisa.Api/Models/ProfessorViewModel.cs
public class ProfessorViewModel
{
    // ... outros campos existentes
    
    public int? InstituicaoId { get; set; }
    
    // ... outros campos
}
```

#### **3. Controller Professor Atualizado**
```csharp
// NpsPesquisa.Api/Controllers/ProfessorController.cs

// Método Create
var professor = new Professor
{
    // ... outros campos
    InstituicaoId = professorViewModel.InstituicaoId,
    // ... outros campos
};

// Método Update
professor.InstituicaoId = professorViewModel.InstituicaoId;

// Métodos GetAll e GetById com Include
return await _context.Professores
    .Include(p => p.Instituicao)
    .Where(p => p.Ativo)
    .OrderBy(p => p.Nome)
    .ToListAsync();
```

#### **4. Migração de Banco de Dados**
```sql
-- Migração: AddInstituicaoIdToProfessor
ALTER TABLE `professores` ADD `InstituicaoId` int NULL;
CREATE INDEX `IX_professores_InstituicaoId` ON `professores` (`InstituicaoId`);
ALTER TABLE `professores` ADD CONSTRAINT `FK_professores_instituicoes_InstituicaoId` 
    FOREIGN KEY (`InstituicaoId`) REFERENCES `instituicoes` (`Id`);
```

### **Frontend (React/Next.js)**

#### **1. Interface Professor Atualizada**
```typescript
interface Professor {
  id: number;
  nome: string;
  email: string;
  // ... outros campos
  instituicaoId?: number;
  instituicao?: {
    id: number;
    nome: string;
  };
  ativo: boolean;
  // ... outros campos
}
```

#### **2. Interface ProfessorFormData Atualizada**
```typescript
interface ProfessorFormData {
  nome: string;
  email: string;
  // ... outros campos
  instituicaoId: string;
  ativo: boolean;
}
```

#### **3. Estado e Carregamento de Dados**
```typescript
const [instituicoes, setInstituicoes] = useState<any[]>([]);

useEffect(() => {
  fetchProfessores();
  fetchInstituicoes(); // Novo
}, []);

const fetchInstituicoes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/Instituicao`);
    if (response.ok) {
      const data = await response.json();
      setInstituicoes(data);
    }
  } catch (error) {
    console.error('Erro ao carregar instituições:', error);
  }
};
```

#### **4. Formulário Atualizado**
```tsx
<HStack spacing={4}>
  <Box flex={1}>
    <Text>ID de Integração</Text>
    <Input
      value={formData.integracaoId}
      onChange={(e) => setFormData({...formData, integracaoId: e.target.value})}
      placeholder="123456789"
    />
  </Box>
  
  <Box flex={1}>
    <Text>Instituição</Text>
    <Select
      value={formData.instituicaoId}
      onChange={(e) => setFormData({...formData, instituicaoId: e.target.value})}
    >
      <option value="">Selecione uma instituição</option>
      {instituicoes.map((instituicao) => (
        <option key={instituicao.id} value={instituicao.id}>
          {instituicao.nome}
        </option>
      ))}
    </Select>
  </Box>
</HStack>
```

#### **5. Tabela Atualizada**
```tsx
<Thead>
  <Tr>
    <Th>Nome</Th>
    <Th>Email</Th>
    <Th>Departamento</Th>
    <Th>Titulação</Th>
    <Th>Instituição</Th> {/* Nova coluna */}
    <Th>Telefone</Th>
    <Th>Data Cadastro</Th>
    <Th>Status</Th>
    <Th>Ações</Th>
  </Tr>
</Thead>

<Tbody>
  {professores.map((professor) => (
    <Tr key={professor.id}>
      {/* ... outras colunas */}
      <Td>
        {professor.instituicao ? (
          <HStack>
            <Building className="h-4 w-4 text-gray-400" />
            <Text fontSize="sm">{professor.instituicao.nome}</Text>
          </HStack>
        ) : (
          <Text fontSize="sm" color="gray.400">Não informada</Text>
        )}
      </Td>
      {/* ... outras colunas */}
    </Tr>
  ))}
</Tbody>
```

#### **6. Funções de Manipulação Atualizadas**
```typescript
// handleEdit
const handleEdit = (professor: Professor) => {
  setEditingProfessor(professor);
  setFormData({
    // ... outros campos
    instituicaoId: professor.instituicaoId?.toString() || '',
    // ... outros campos
  });
  onOpen();
};

// handleSubmit
const payload = {
  ...formData,
  instituicaoId: formData.instituicaoId ? parseInt(formData.instituicaoId) : null,
  // ... outros campos
};

// resetForm
const resetForm = () => {
  setFormData({
    // ... outros campos
    instituicaoId: '',
    // ... outros campos
  });
  setEditingProfessor(null);
};
```

## 🎯 Funcionalidades Implementadas

### **✅ Cadastro de Professor**
- Campo "Instituição" adicionado ao formulário
- Carregamento automático da lista de instituições
- Validação e salvamento da instituição selecionada

### **✅ Edição de Professor**
- Campo "Instituição" pré-preenchido com valor atual
- Atualização da instituição na edição
- Preservação da instituição existente

### **✅ Listagem de Professores**
- Nova coluna "Instituição" na tabela
- Exibição do nome da instituição com ícone
- Fallback para "Não informada" quando não há instituição

### **✅ Relacionamento de Banco**
- Chave estrangeira `InstituicaoId` na tabela `professores`
- Relacionamento com a tabela `instituicoes`
- Índice para performance otimizada

## 🔄 Fluxo de Funcionamento

### **1. Cadastro de Novo Professor**
1. Usuário acessa a página de professores
2. Clica em "Criar Professor"
3. Preenche os dados básicos (nome, email, etc.)
4. **Seleciona a instituição** no dropdown
5. Salva o professor com a instituição associada

### **2. Edição de Professor Existente**
1. Usuário clica em "Editar" em um professor
2. Modal abre com dados pré-preenchidos
3. **Campo instituição** mostra a instituição atual
4. Usuário pode alterar a instituição se necessário
5. Salva as alterações

### **3. Visualização na Lista**
1. Lista de professores carrega com dados das instituições
2. **Nova coluna "Instituição"** mostra o nome da instituição
3. Ícone de prédio para identificação visual
4. "Não informada" para professores sem instituição

## 📊 Estrutura de Dados

### **Tabela `professores`**
```sql
CREATE TABLE professores (
  Id int PRIMARY KEY,
  Nome varchar(200) NOT NULL,
  Email varchar(200) NOT NULL,
  -- ... outros campos
  InstituicaoId int NULL,
  -- ... outros campos
  FOREIGN KEY (InstituicaoId) REFERENCES instituicoes(Id)
);
```

### **Relacionamento**
```
Professor (1) ←→ (N) Instituicao
- Um professor pertence a uma instituição (opcional)
- Uma instituição pode ter vários professores
```

## 🎉 Benefícios das Correções

### **✅ Integridade de Dados**
- **Relacionamento correto** entre professores e instituições
- **Validação** de dados no backend
- **Consistência** entre frontend e backend

### **✅ Usabilidade**
- **Interface intuitiva** com dropdown de instituições
- **Visualização clara** da instituição na lista
- **Edição fácil** da instituição do professor

### **✅ Funcionalidade**
- **Filtros por instituição** (futuro)
- **Relatórios por instituição** (futuro)
- **Gestão organizacional** melhorada

---

**Status**: ✅ Implementado  
**Data**: $(date)  
**Versão**: 1.2.0
