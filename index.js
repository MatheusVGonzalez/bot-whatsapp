const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const config = require('./config');

console.log('🤖 Iniciando Bot WhatsApp para Escritório de Advocacia...');

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: "advocacia-bot"
  }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  }
});

function buildResponse(body) {
  const msg = (body || '').toLowerCase().trim();
  switch (msg) {
    case 'menu': return config.messages.menu;
    case '1': return config.messages.fiscal;
    case '2': return config.messages.contabil;
    case '3': return config.messages.financeiro;
    case '4': return config.messages.atendente;
    default: return config.messages.invalidOption;
  }
}

client.on('qr', (qr) => {
  console.log('\n📱 Escaneie o QR Code abaixo com seu WhatsApp:\n');
  qrcode.generate(qr, { small: true });
  console.log('\n⚠️  IMPORTANTE: Após escanear, aguarde a mensagem "Cliente conectado!"');
});

client.on('ready', () => {
  console.log('✅ Cliente conectado com sucesso!');
  console.log(`🔐 Bot configurado para responder apenas ao número: ${config.authorizedNumber}`);
  console.log('🚀 Bot está funcionando! Aguardando mensagens...\n');
});

const ALLOWED_COMMANDS = new Set(['menu','1','2','3','4']);

async function processIncoming({ chatId, senderId, rawBody, isGroup }) {
  if (senderId !== config.authorizedNumber) return;
  const response = buildResponse(rawBody);
  if (!response) return;
  await client.sendMessage(chatId, response);
  console.log(`✅ Resposta enviada para ${senderId} (chat: ${chatId})`);
}

client.on('message', async (message) => {
  try {
    const chatId = message.from;
    const isGroup = chatId.endsWith('@g.us');
    const senderId = isGroup ? message.author : chatId;
    if (isGroup && !senderId) return; 

    console.log(`[message] chat=${chatId} sender=${senderId} body="${message.body}"`);

    await processIncoming({
      chatId,
      senderId,
      rawBody: message.body,
      isGroup
    });
  } catch (err) {
    console.error('❌ Erro handler message:', err);
  }
});

client.on('message_create', async (message) => {
  try {
    if (!message.fromMe) return; 
    const chatId = message.to || message.from;
    const isGroup = chatId.endsWith('@g.us');
    const senderId = config.authorizedNumber; 

    const body = (message.body || '').toLowerCase().trim();
    if (!ALLOWED_COMMANDS.has(body)) {
      return;
    }

    console.log(`[message_create/fromMe] Simulando processamento self-chat body="${body}"`);

    await processIncoming({
      chatId,
      senderId,
      rawBody: body,
      isGroup
    });
  } catch (err) {
    console.error('❌ Erro handler message_create:', err);
  }
});

client.on('auth_failure', (message) => {
  console.error('❌ Falha na autenticação:', message);
});

client.on('disconnected', (reason) => {
  console.log('⚠️  Cliente desconectado:', reason);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Erro não tratado:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Exceção não capturada:', error);
  process.exit(1);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Encerrando bot...');
  await client.destroy();
  process.exit(0);
});

console.log('⏳ Inicializando cliente WhatsApp...');
client.initialize();