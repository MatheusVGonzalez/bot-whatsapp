const config = {
  // Número autorizado para testar / operar (JID completo)
  authorizedNumber: "5511945572054@c.us",

  /**
   * Definição dos setores disponíveis.
   * Preencha os campos contactJid com o número do responsável de cada setor
   * no formato DDI + DDD + número + '@c.us' (ex: 5511999999999@c.us).
   * Se ainda não tiver, deixe como null e o bot apenas responderá ao usuário.
   */
  sectors: [
    {
      option: '1',
      key: 'administrativo',
      label: 'Administrativo',
      contactJid: null, // so coloca aqui o numero com @c.us
      urgent: false,
      userMessage: `🗂️ *Administrativo*\n\nRecebemos sua solicitação. Nossa equipe administrativa retornará em breve.\n\n⏰ Horário: Seg a Sex, 8h às 18h` ,
      notifyTemplate: (fromJid) => `📥 Nova solicitação - Setor Administrativo\nOrigem: ${fromJid}`
    },
    {
      option: '2',
      key: 'processual',
      label: 'Questões Processuais',
      contactJid: null,
      urgent: false,
      userMessage: `📑 *Questões Processuais*\n\nSua mensagem foi registrada. Um responsável processual fará contato.\n\n⏰ Horário: Seg a Sex, 8h às 18h`,
      notifyTemplate: (fromJid) => `📥 Nova solicitação - Processo\nOrigem: ${fromJid}`
    },
    {
      option: '3',
      key: 'urgencia',
      label: 'Extrema Urgência',
      contactJid: null,
      urgent: true,
      userMessage: `🚨 *Extrema Urgência*\n\nSua solicitação foi destacada como prioridade máxima. Um responsável será acionado imediatamente.` ,
      notifyTemplate: (fromJid) => `🚨 URGÊNCIA! Contato imediato requerido. Origem: ${fromJid}`
    }
  ],

  messages: {
    buildMenu(sectors) {
      const linhas = sectors.map(s => `${s.option}️⃣  - ${s.label}`).join('\n');
      return `🏛️ *Atendimento*\n\nEscolha uma das opções:\n\n${linhas}\n\n_Digite o número da opção desejada_`;
    },
    invalidOption: `❌ Opção inválida. Digite *menu* para ver as opções.`
  }
};

module.exports = config;