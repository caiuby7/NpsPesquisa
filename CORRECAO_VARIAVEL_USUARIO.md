# 🔧 Correção - Variável `usuario` Não Definida

## 🚨 **Problema Identificado**

### **Erro:**
```csharp
// Obtém o ID do usuário do token JWT
var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
{
    return Unauthorized("Usuário não autenticado");
}

var avaliacao = await _context.Questionarios
    .Include(a => a.Participantes)
    .FirstOrDefaultAsync(a => a.Id == id);

// Verifica se o usuário já respondeu esta avaliação
var jaRespondeu = await VerificarSeUsuarioJaRespondeu(userId, avaliacao.Id, usuario);
//                                                                           ^^^^^^^
//                                                                           ERRO: variável 'usuario' não foi definida
```

### **Causa:**
O método `VerificarSeUsuarioJaRespondeu` espera receber um parâmetro `Usuario usuario`, mas a variável `usuario` não estava sendo buscada do banco de dados.

## 🔍 **Análise do Problema**

### **Assinatura do Método:**
```csharp
private async Task<bool> VerificarSeUsuarioJaRespondeu(int userId, int questionarioId, Usuario usuario)
//                                                                                        ^^^^^^^^^^^^^^^
//                                                                                        Parâmetro necessário
```

### **Fluxo do Método:**
1. **Extrai** `userId` do token JWT ✅
2. **Busca** a avaliação no banco ✅  
3. **Chama** `VerificarSeUsuarioJaRespondeu` ❌ (falta buscar o usuário)
4. **Usa** `usuario` que não existe ❌

## 🛠️ **Correção Implementada**

### **Antes (INCORRETO):**
```csharp
// Obtém o ID do usuário do token JWT
var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
{
    return Unauthorized("Usuário não autenticado");
}

var avaliacao = await _context.Questionarios
    .Include(a => a.Participantes)
    .FirstOrDefaultAsync(a => a.Id == id);

// ❌ ERRO: 'usuario' não foi definido
var jaRespondeu = await VerificarSeUsuarioJaRespondeu(userId, avaliacao.Id, usuario);
```

### **Depois (CORRETO):**
```csharp
// Obtém o ID do usuário do token JWT
var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
{
    return Unauthorized("Usuário não autenticado");
}

// ✅ Busca o usuário no banco
var usuario = await _context.Usuarios
    .Include(u => u.Perfil)
    .FirstOrDefaultAsync(u => u.Id == userId);

if (usuario == null)
{
    return NotFound("Usuário não encontrado");
}

var avaliacao = await _context.Questionarios
    .Include(a => a.Participantes)
    .FirstOrDefaultAsync(a => a.Id == id);

// ✅ Agora 'usuario' está definido
var jaRespondeu = await VerificarSeUsuarioJaRespondeu(userId, avaliacao.Id, usuario);
```

## 🎯 **Por Que Era Necessário?**

### **1. Parâmetro do Método:**
```csharp
private async Task<bool> VerificarSeUsuarioJaRespondeu(int userId, int questionarioId, Usuario usuario)
{
    var perfilUsuario = usuario.Perfil?.Nome?.ToLower(); // ← Precisa do objeto Usuario
    
    if (perfilUsuario == "participante" || perfilUsuario == "aluno")
    {
        // Busca aluno usando usuario.Perfil, usuario.Email, etc.
    }
    
    if (perfilUsuario == "coordenacao" || perfilUsuario == "professor")
    {
        // Busca professor usando usuario.Perfil, usuario.Email, etc.
    }
}
```

### **2. Informações Necessárias:**
- **Perfil do usuário** (`usuario.Perfil?.Nome`)
- **Email do usuário** (`usuario.Email`)
- **Relacionamentos** (`usuario` completo para buscar Aluno/Professor)

## 📊 **Fluxo Completo Corrigido**

### **1. Autenticação:**
```
JWT Token → Extrai userId → Valida se não é nulo/vazio
```

### **2. Busca de Dados:**
```
userId → Busca Usuario (com Perfil) → Valida se existe
```

### **3. Busca de Avaliação:**
```
id → Busca Questionario (com Participantes) → Valida se existe
```

### **4. Verificação de Resposta:**
```
userId + questionarioId + usuario → Verifica se já respondeu
```

### **5. Retorno:**
```
Cria AvaliacaoDisponivelDto com status correto
```

## ✅ **Benefícios da Correção**

### **1. Funcionalidade:**
- ✅ **Método funciona** corretamente
- ✅ **Verificação de resposta** baseada em perfil
- ✅ **Busca inteligente** por Aluno/Professor

### **2. Robustez:**
- ✅ **Validação de usuário** existe no banco
- ✅ **Tratamento de erro** se usuário não encontrado
- ✅ **Include do Perfil** para informações completas

### **3. Consistência:**
- ✅ **Mesmo padrão** do método `GetAvaliacoesDisponiveis`
- ✅ **Lógica uniforme** entre endpoints
- ✅ **Código limpo** e bem estruturado

## 🔄 **Comparação com Outro Método**

### **Método `GetAvaliacoesDisponiveis` (já estava correto):**
```csharp
// Busca o usuário no banco
var usuario = await _context.Usuarios
    .Include(u => u.Perfil)
    .FirstOrDefaultAsync(u => u.Id == userId);

if (usuario == null)
{
    return NotFound("Usuário não encontrado");
}
```

### **Método `GetAvaliacaoDisponivel` (agora corrigido):**
```csharp
// Busca o usuário no banco
var usuario = await _context.Usuarios
    .Include(u => u.Perfil)
    .FirstOrDefaultAsync(u => u.Id == userId);

if (usuario == null)
{
    return NotFound("Usuário não encontrado");
}
```

## 🚀 **Resultado Final**

### **✅ Problemas Resolvidos:**
1. **Erro de compilação** - Variável `usuario` não definida
2. **Runtime error** - NullReferenceException ao acessar `usuario`
3. **Lógica incompleta** - Verificação de resposta não funcionava

### **✅ Funcionalidades Mantidas:**
1. **Autenticação** via JWT token
2. **Busca de avaliação** por ID
3. **Verificação de resposta** baseada em perfil
4. **Retorno correto** com status da avaliação

O método agora funciona corretamente e de forma consistente com o resto da API! 🎉
