const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const config = require('./config');

console.log('🤖 Iniciando Bot WhatsApp – Setores personalizados...');

const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'advocacia-bot' }),
  puppeteer: { headless: true, args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--disable-accelerated-2d-canvas','--no-first-run','--no-zygote','--disable-gpu'] }
});

function getSectorByOption(opt){
  return config.sectors.find(s => s.option === opt);
}

function buildMenu(){
  return config.messages.buildMenu(config.sectors);
}

function buildResponse(body){
  const msg = (body || '').toLowerCase().trim();
  if (msg === 'menu') return buildMenu();
  const sector = getSectorByOption(msg);
  if (sector) return sector.userMessage;
  return config.messages.invalidOption;
}

async function notifySector(sector, originJid){
  if (!sector.contactJid) return; // ainda não configurado

  // Normalizar JID: garantir sufixo @c.us e somente dígitos antes
  let jid = sector.contactJid.trim();
  if (!jid.endsWith('@c.us')) {
    // Se usuário esqueceu, tentar corrigir automaticamente
    if (/^\d{11,15}$/.test(jid)) {
      jid = jid + '@c.us';
    } else {
      console.warn(`⚠️ JID inválido para setor ${sector.key}: "${sector.contactJid}" (não enviado)`);
      return;
    }
  }

  if (!/^\d{11,15}@c\.us$/.test(jid)) {
    console.warn(`⚠️ Formato inesperado de JID após normalização: ${jid}`);
    return;
  }

  try {
    const text = sector.notifyTemplate(originJid);
    await client.sendMessage(jid, text);
    console.log(`📤 Notificação enviada ao responsável (${sector.key}) -> ${jid}`);
  } catch (e) {
    console.error(`⚠️ Erro ao notificar responsável (${sector.key}) JID=${jid}:`, e.message);
  }
}

const ALLOWED_COMMANDS = new Set(['menu','1','2','3']);

async function processIncoming({ chatId, senderId, rawBody }) {
  if (senderId !== config.authorizedNumber) return; // somente número autorizado

  const clean = (rawBody || '').toLowerCase().trim();
  const isMenu = clean === 'menu';
  const sector = getSectorByOption(clean);

  const response = buildResponse(rawBody);
  await client.sendMessage(chatId, response);
  console.log(`✅ Resposta enviada para ${senderId} (opção: ${clean || 'n/a'})`);

  if (sector) {
    if (sector.urgent) console.log('🚨 Setor de urgência selecionado. Enviando notificação (se configurado)...');
    await notifySector(sector, senderId);
  }
}

client.on('qr', qr => { console.log('\n📱 Escaneie o QR Code abaixo:\n'); qrcode.generate(qr,{small:true}); console.log('\nAguarde confirmação de conexão...'); });
client.on('ready', () => {
  console.log('✅ Conectado.');
  console.log('🔐 Número autorizado:', config.authorizedNumber);
  console.log(`🧭 Menu pronto:\n${buildMenu()}`);
});

client.on('message', async message => {
  try {
    const chatId = message.from;
    const isGroup = chatId.endsWith('@g.us');
    const senderId = isGroup ? message.author : chatId;
    if (isGroup && !senderId) return;
    console.log(`[message] chat=${chatId} sender=${senderId} body="${message.body}"`);
    await processIncoming({ chatId, senderId, rawBody: message.body });
  } catch (e) { console.error('❌ Erro handler message:', e); }
});

client.on('message_create', async message => {
  try {
    if (!message.fromMe) return;
    const chatId = message.to || message.from;
    const senderId = config.authorizedNumber;
    const body = (message.body || '').toLowerCase().trim();
    if (!ALLOWED_COMMANDS.has(body)) return;
    console.log(`[message_create/fromMe] body="${body}"`);
    await processIncoming({ chatId, senderId, rawBody: body });
  } catch (e) { console.error('❌ Erro handler message_create:', e); }
});

client.on('auth_failure', msg => console.error('❌ Falha autenticação:', msg));
client.on('disconnected', r => console.log('⚠️ Desconectado:', r));
process.on('unhandledRejection', r => console.error('❌ Rejeição não tratada:', r));
process.on('uncaughtException', e => { console.error('❌ Exceção não capturada:', e); process.exit(1); });
process.on('SIGINT', async () => { console.log('\n🛑 Encerrando...'); await client.destroy(); process.exit(0); });

console.log('⏳ Inicializando...');
client.initialize();