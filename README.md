# 🤖 Bot WhatsApp - Escritório de Advocacia

Bot de atendimento automático para escritório de advocacia usando WhatsApp Web.

## 📋 Funcionalidades

- ✅ Autenticação via QR Code (LocalAuth)
- ✅ Responde apenas a um número específico (para testes)
- ✅ Menu interativo com áreas do escritório
- ✅ Respostas automáticas por área
- ✅ Redirecionamento para atendente humano

## 🚀 Como usar

### 1. Instalação

```bash
# Instalar dependências
npm install
```

### 2. Configuração

Edite o arquivo `config.js` e altere o número autorizado:

```javascript
authorizedNumber: "5511999999999@c.us", // Substitua pelo seu número
```

### 3. Executar o bot

```bash
# Executar
npm start

# Ou em modo desenvolvimento
npm run dev
```

### 4. Conectar ao WhatsApp

1. Execute o bot
2. Escaneie o QR Code que aparecerá no terminal
3. Aguarde a mensagem "Cliente conectado!"
4. Teste enviando "menu" para o número configurado

## 📱 Como testar

1. Do seu número configurado, envie: `menu`
2. Você receberá as opções:
   - **1** - Fiscal
   - **2** - Contábil  
   - **3** - Financeiro
   - **4** - Falar com atendente

3. Responda com o número da opção desejada

## 🔧 Estrutura do projeto

```
bot-whatsapp/
├── index.js          # Arquivo principal do bot
├── config.js         # Configurações e mensagens
├── package.json      # Dependências do projeto
├── .gitignore        # Arquivos ignorados pelo Git
└── README.md         # Este arquivo
```

## ⚙️ Configurações

### Personalizar mensagens

Edite o arquivo `config.js` para alterar as mensagens do bot:

- Menu de opções
- Mensagens de resposta para cada área
- Mensagem de opção inválida

### Adicionar mais números autorizados

Para responder a mais números, modifique a lógica no `index.js`:

```javascript
// Ao invés de verificar apenas um número:
if (message.from !== config.authorizedNumber) {
    return;
}

// Use um array de números:
const authorizedNumbers = ["5511999999999@c.us", "5511888888888@c.us"];
if (!authorizedNumbers.includes(message.from)) {
    return;
}
```

## 🛡️ Segurança

- O bot está configurado para responder **APENAS** ao número especificado
- Todos os outros contatos são ignorados
- Ideal para testes sem incomodar clientes reais

## 📦 Dependências

- `whatsapp-web.js`: Biblioteca para integração com WhatsApp Web
- `qrcode-terminal`: Exibição do QR Code no terminal

## ⚠️ Importante

- Mantenha o terminal aberto enquanto o bot estiver funcionando
- A primeira execução pode demorar mais para baixar o navegador
- Após a primeira autenticação, as próximas inicializações serão mais rápidas
- **SEMPRE** altere o número autorizado antes de usar em produção

## 🆘 Solução de problemas

### Bot não conecta
- Verifique sua conexão com a internet
- Certifique-se de que o WhatsApp Web funciona no seu navegador
- Tente deletar a pasta `.wwebjs_auth` e conectar novamente

### Bot não responde
- Verifique se configurou o número correto no `config.js`
- Confirme que está enviando mensagens do número autorizado
- Verifique os logs no terminal para erros

### Erro de instalação
- Certifique-se de ter Node.js instalado (versão 14 ou superior)
- Execute `npm install` novamente
- No Windows, pode ser necessário instalar ferramentas de build