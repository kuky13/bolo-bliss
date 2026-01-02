
# 📄 Configurações do Site

Este diretório contém os arquivos de configuração do site. Você pode editar estes arquivos para personalizar sua loja sem precisar saber programação.

## 📋 Como Editar os Arquivos

1. Clique no arquivo que deseja editar
2. Clique no botão "Editar" ou no ícone de lápis
3. Faça suas alterações seguindo o formato existente
4. Salve o arquivo

⚠️ **Importante:** Mantenha o formato JSON dos arquivos. Não remova as vírgulas, chaves ou aspas, pois isso pode fazer o site parar de funcionar.

## 📁 Arquivos de Configuração

### 🏪 `store.json` - Configurações da Loja
Contém informações básicas como nome da loja, número de WhatsApp, taxa de entrega, etc.

### 🛒 `products.json` - Produtos da Loja
Lista completa dos produtos disponíveis na loja. Para adicionar um novo produto:
- Copie um bloco existente (tudo entre `{` e `}`, incluindo as chaves)
- Cole ao final da lista (antes do `]` final)
- Adicione uma vírgula após o produto anterior
- Atualize as informações do novo produto

### 🎟️ `coupons.json` - Cupons de Desconto
Cupons de desconto disponíveis na loja. Para adicionar um novo cupom:
- Copie um bloco existente (tudo entre `{` e `}`, incluindo as chaves)
- Cole ao final da lista (antes do `]` final)
- Adicione uma vírgula após o cupom anterior
- Atualize as informações do novo cupom

### 🎨 `appearance.json` - Aparência do Site
Configurações visuais como cores, fontes e layout.

## 📝 Exemplos

### Adicionando um Produto:
```json
[
  {
    "id": "1",
    "name": "Produto Existente",
    "price": 10.50,
    ...
  },
  {
    "id": "2", 
    "name": "Novo Produto",
    "description": "Descrição do novo produto",
    "price": 25.90,
    "imageUrl": "/placeholder.svg",
    "featured": false,
    "category": "Categoria"
  }
]
```

### Adicionando um Cupom:
```json
[
  {
    "code": "CUPOM1",
    "discountType": "percentage",
    ...
  },
  {
    "code": "NOVO10",
    "discountType": "percentage",
    "discountValue": 10,
    "minOrderValue": 0,
    "active": true,
    "description": "10% de desconto"
  }
]
```

## 📱 Configuração do WhatsApp

No arquivo `store.json`, você pode configurar seu número de WhatsApp:
- Use o formato: `5511999999999` (55 = Brasil, seguido do DDD e número)
- Não use espaços, parênteses ou traços
