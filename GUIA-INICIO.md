# 🚀 Guia de Início Rápido

## Passo a passo para configurar o bot:

### 1. **Configure seu número**
Abra o arquivo `config.js` e altere a linha:
```javascript
authorizedNumber: "5511999999999@c.us", // ALTERE AQUI
```

**Formato correto:**
- Brasil: `55` + DDD + número
- Exemplo: `5511987654321@c.us`

### 2. **Execute o bot**
```bash
npm start
```

### 3. **Conecte ao WhatsApp**
- Um QR Code aparecerá no terminal
- Abra o WhatsApp no seu celular
- Vá em **Dispositivos Conectados**
- Escaneie o QR Code
- Aguarde a mensagem "Cliente conectado!"

### 4. **Teste o bot**
Do seu número configurado, envie:
```
menu
```

Você receberá:
```
🏛️ Escritório de Advocacia

Escolha uma das opções abaixo:

1️⃣ - Fiscal
2️⃣ - Contábil  
3️⃣ - Financeiro
4️⃣ - Falar com um atendente

Digite o número da opção desejada
```

### 5. **Teste as respostas**
Envie `1`, `2`, `3` ou `4` para testar cada área.

---

## ⚠️ Lembrete Importante

**O bot só responde ao SEU número configurado!**

Isso é proposital para evitar que clientes reais recebam mensagens durante os testes.

---

## 🔧 Para usar em produção

1. Altere as mensagens no `config.js`
2. Modifique a lógica para aceitar múltiplos números
3. Adicione logs mais detalhados
4. Configure um servidor para manter o bot sempre ativo