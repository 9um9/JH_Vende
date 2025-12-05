document.getElementById('toggleSidebar').addEventListener('click',()=>{
  document.getElementById('sidebar').classList.toggle('expanded');
});
const wBtn = document.getElementById('whatsappBtn');
const wModal = document.getElementById('whatsappModal');
const closeModal = document.getElementById('closeModal');
wBtn.addEventListener('click',()=>{wModal.style.display='flex';});
closeModal.addEventListener('click',()=>{wModal.style.display='none';});
window.addEventListener('click',(e)=>{if(e.target===wModal)wModal.style.display='none';});

document.addEventListener('DOMContentLoaded', () => {
  const productEls = Array.from(document.querySelectorAll('.product-card'));
  const products = productEls.map(el => {
    const titleEl = el.querySelector('h2');
    const descEl = el.querySelector('.desc');
    const priceEl = el.querySelector('.price');
    const imgEl = el.querySelector('img');
    return {
      title: titleEl ? titleEl.textContent.trim() : '',
      titleTokens: titleEl ? titleEl.textContent.toLowerCase().split(/\s+/) : [],
      desc: descEl ? descEl.textContent.trim() : '',
      price: priceEl ? priceEl.textContent.trim() : '',
      img: imgEl ? imgEl.src : ''
    };
  });

  const aiToggleBtn = document.getElementById('aiToggleBtn');
  const aiPanel = document.getElementById('aiPanel');
  const aiCloseBtn = document.getElementById('aiCloseBtn');
  const aiMessages = document.getElementById('aiMessages');
  const aiInput = document.getElementById('aiInput');
  const aiSendBtn = document.getElementById('aiSendBtn');

  if (!aiToggleBtn || !aiPanel || !aiMessages || !aiInput || !aiSendBtn) {
    console.warn('Elementos do chat não encontrados');
    return;
  }

  // Avatar do bot
  const BOT_AVATAR = 'https://instagram.fitr1-1.fna.fbcdn.net/v/t51.2885-19/545511913_17862733770477822_2239843355105191450_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDI0LmMyIn0&_nc_ht=instagram.fitr1-1.fna.fbcdn.net&_nc_cat=106&_nc_oc=Q6cZ2QH8oEtNEjwWphxoorQK56oQb3l0-oiAoULl0gBE78-NBSVeEnsyqcInl5hUjawYl5I&_nc_ohc=-oeOB2XpbckQ7kNvwGC5e8e&_nc_gid=3Z_MB_oyIteV9aESQBJRuQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_Afi5WDwrJmKJT3D60T5VzON-Zxx2zJQ3wy_vXWv5JeH2Sw&oe=692E3F98&_nc_sid=7a9f4b';

  // Utils UI: safety on user messages + small typing indicator
  function appendMessage(text, from = 'bot') {
    const wrap = document.createElement('div');
    wrap.className = from === 'user' ? 'ai-msg user' : 'ai-msg bot';

    const bubble = document.createElement('div');
    bubble.className = 'ai-msg-text';

    if (from === 'user') {
      bubble.textContent = text; // escape user text
    } else {
      bubble.innerHTML = text; // bot responses contain HTML formatting
    }

    if (from === 'bot') {
      const avatar = document.createElement('img');
      avatar.className = 'ai-avatar';
      avatar.src = BOT_AVATAR;
      avatar.alt = 'Assistente';
      wrap.appendChild(avatar);
      wrap.appendChild(bubble);
    } else {
      wrap.appendChild(bubble);
    }

    aiMessages.appendChild(wrap);
    aiMessages.scrollTop = aiMessages.scrollHeight;
    return wrap;
  }

  function showTypingIndicator(){
    const typing = document.createElement('div');
    typing.className = 'ai-msg bot typing';
    const avatar = document.createElement('img');
    avatar.className = 'ai-avatar';
    avatar.src = BOT_AVATAR;
    avatar.alt = 'Assistente';
    const bubble = document.createElement('div');
    bubble.className = 'ai-msg-text';
    bubble.innerHTML = '<em>Digitando...</em>';
    typing.appendChild(avatar);
    typing.appendChild(bubble);
    aiMessages.appendChild(typing);
    aiMessages.scrollTop = aiMessages.scrollHeight;
    return typing;
  }

  // State and open/close helpers
  let panelOpen = false;
  function setPanelOpen(open) {
    panelOpen = Boolean(open);
    if (panelOpen) {
      aiPanel.setAttribute('aria-hidden', 'false');
      aiPanel.classList.add('open');
      aiToggleBtn.classList.add('hidden'); // keep UX of hiding button when panel open
      aiToggleBtn.setAttribute('aria-pressed', 'true');
      aiMessages.innerHTML = '';
      appendMessage('Olá! Sou a assistente de produtos da JH_Vende. Posso ajudar com:<br/>✅ Informações sobre produtos<br/>✅ Preços e promoções<br/>✅ Dúvidas sobre garantia e entrega<br/>✅ Perguntas sobre Open Box<br/>Qual é sua dúvida? 😊', 'bot');
      const suggestions = [
        '• "Qual é o preço do Redmi Note 12?"',
        '• "O que é Open Box?"',
        '• "Por que Open Box é mais barato?"',
        '• "Como funciona a garantia?"',
        '• "Qual é o horário de atendimento?"',
        '• "Ver lista de produtos"'
      ].join('<br/>');
      appendMessage(`Aqui estão algumas sugestões de perguntas:<br/>${suggestions}`, 'bot');
      aiInput.focus();
    } else {
      aiPanel.setAttribute('aria-hidden', 'true');
      aiPanel.classList.remove('open');
      aiToggleBtn.classList.remove('hidden');
      aiToggleBtn.setAttribute('aria-pressed', 'false');
      aiToggleBtn.focus();
    }
  }
  function openPanel() { setPanelOpen(true); }
  function closePanel() { setPanelOpen(false); }

  // Single, clear event listener setup for chat
  // Toggle button - single handler (prevents event bubbling so document click doesn't immediately close it)
  aiToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    setPanelOpen(!panelOpen);
  });

  // Close button - single handler
  aiCloseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closePanel();
  });

  // Prevent clicks inside the panel from bubbling to document
  aiPanel.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Clicking outside (document) closes the panel when open
  document.addEventListener('click', (e) => {
    if (panelOpen && !aiPanel.contains(e.target) && !aiToggleBtn.contains(e.target)) {
      closePanel();
    }
  });

  // Escape key closes the panel when open
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panelOpen) {
      closePanel();
      e.stopPropagation();
    }
  });

  // Base de conhecimento expandida com formalidade
  const knowledgeBase = {
    owner: {
      keywords: ['dono', 'proprietário', 'quem', 'criador', 'fundador', 'empresa', 'loja', 'nome da loja'],
      response: 'Este site pertence à <strong>JH_Vende</strong>, uma empresa especializada na comercialização de celulares, hardwares e diversos itens eletrônicos. Caso deseje mais informações institucionais, estamos à disposição.'
    },
    about: {
      keywords: ['sobre', 'quem é', 'qual é o nome', 'empresa', 'loja', 'história', 'o que vocês', 'o que é'],
      response: '<strong>JH_Vende</strong> é uma empresa dedicada à venda de produtos eletrônicos. Oferecemos celulares novos e seminovos, hardwares, adaptadores e outros itens, sempre prezando pela qualidade e atendimento ao cliente. Todos os produtos são testados e possuem garantia de 3 meses.'
    },
    contact: {
      keywords: ['contato', 'whatsapp', 'instagram', 'facebook', 'entrar em contato', 'ligar', 'enviar mensagem', 'suporte', 'fone', 'telefone', 'comunicar', 'atendimento'],
      response: 'Para entrar em contato conosco, utilize um dos canais oficiais:<br/>• <strong>WhatsApp:</strong> Botão no topo da página<br/>• <strong>Instagram:</strong> @jh_vende<br/>• <strong>Facebook:</strong> Página oficial<br/>• <strong>TikTok:</strong> Canal oficial<br/>Será um prazer atendê-lo(a) e responder prontamente.'
    },
    guarantee: {
      keywords: ['garantia', 'garant', 'qualidade', 'testado', 'durabilidade', 'meses'],
      response: 'Todos os produtos comercializados pela <strong>JH_Vende</strong> são rigorosamente testados e acompanham <strong>garantia de 3 meses</strong> contra defeitos de fabricação. Prezamos pela sua tranquilidade e satisfação.'
    },
    hours: {
      keywords: ['horário', 'hora', 'abre', 'fecha', 'funcionamento', 'atende', 'abierto', 'horario'],
      response: 'Nosso atendimento via WhatsApp está disponível <strong>24 horas</strong> por dia. Para atendimento presencial, consulte previamente a disponibilidade. Estamos sempre prontos para melhor atendê-lo(a).'
    },
    address: {
      keywords: ['endereço', 'localização', 'local', 'onde fica', 'rua', 'avenida', 'cidade', 'morada'],
      response: 'Para informações sobre endereço físico e localização, solicitamos que entre em contato conosco via WhatsApp. Teremos satisfação em fornecer todos os detalhes necessários.'
    },
    payment: {
      keywords: ['pagamento', 'pagar', 'formas de pagamento', 'cartão', 'boleto', 'pix', 'crediário', 'parcelado', 'à vista'],
      response: 'Aceitamos diversas formas de pagamento, incluindo cartões, Pix e boleto bancário. Para condições especiais, parcelamentos ou promoções, por gentileza, consulte-nos via WhatsApp.'
    },
    shipping: {
      keywords: ['envio', 'entrega', 'frete', 'enviar', 'como chega', 'quanto tempo', 'rastreamento', 'sedex', 'pac'],
      response: 'Realizamos envios para todo o Brasil, com opções de frete variadas. Para prazos, valores e rastreamento, entre em contato conosco. Será um prazer auxiliá-lo(a) em sua compra.'
    },
    return: {
      keywords: ['devolução', 'devolver', 'retorno', 'troca', 'defeito', 'problema', 'reclamação', 'insatisfeito'],
      response: 'Nossa política de devolução e troca visa garantir sua satisfação. Caso haja qualquer problema com o produto, solicitamos que nos comunique imediatamente para que possamos solucionar da melhor forma possível.'
    },
    promotion: {
      keywords: ['promoção', 'desconto', 'oferta', 'promocao', 'black friday', 'liquidação', 'queima', 'promo'],
      response: 'Nossas promoções e ofertas especiais são divulgadas em nossos canais oficiais. Siga-nos no <strong>Instagram @jh_vende</strong> e consulte-nos via WhatsApp para não perder oportunidades exclusivas.'
    },
    used: {
      keywords: ['usado', 'seminovo', 'refurbished', 'recuperado', 'aparelhado', 'recondicionado', 'estado'],
      response: 'Disponibilizamos produtos usados e seminovos, todos testados e com garantia de 3 meses. Caso tenha interesse em algum item específico, estamos à disposição para fornecer mais detalhes.'
    },
    warranty_period: {
      keywords: ['período de garantia', 'quantos meses', 'quanto tempo de garantia', 'prazo da garantia'],
      response: 'O prazo de garantia para todos os produtos é de <strong>3 meses</strong>, cobrindo eventuais defeitos de fabricação. Para mais informações, consulte nossos termos ou entre em contato.'
    },
    product_condition: {
      keywords: ['condição', 'como é', 'estado do produto', 'novo', 'caixa', 'acessórios', 'completo'],
      response: 'Todos os produtos são cuidadosamente inspecionados antes do envio. Para informações detalhadas sobre acessórios, embalagem ou estado de conservação, por favor, informe o produto desejado.'
    },
    categories: {
      keywords: ['categorias', 'o que vocês vendem', 'tipos de produtos', 'produtos', 'itens', 'qual é a gama', 'tipos'],
      response: 'Trabalhamos com:<br/>• <strong>Celulares</strong> (novos e seminovos)<br/>• <strong>Hardwares</strong> (GPUs, processadores, placas-mãe)<br/>• <strong>Adaptadores</strong> (VGA, HDMI, WiFi)<br/>• <strong>Open Box</strong> (produtos novos com desconto)<br/>• <strong>Diversos itens eletrônicos</strong><br/>Para lista completa, consulte nosso catálogo.'
    },
    installation: {
      keywords: ['instalação', 'instalar', 'como instalar', 'setup', 'configuração', 'auxílio'],
      response: 'Caso necessite de auxílio para instalação ou configuração de produtos, nossa equipe está pronta para orientá-lo(a). Entre em contato para suporte técnico especializado.'
    },
    technical_support: {
      keywords: ['suporte técnico', 'técnico', 'problema', 'não funciona', 'erro', 'bug', 'crash', 'trava'],
      response: 'Disponibilizamos suporte técnico para todos os produtos adquiridos conosco. Em caso de dúvidas ou dificuldades, não hesite em nos acionar. Buscamos sempre a melhor solução para nossos clientes.'
    },
    bulk_purchase: {
      keywords: ['atacado', 'varejo', 'lote', 'quantidade', 'revenda', 'grande quantidade', 'empresa'],
      response: 'Oferecemos condições especiais para compras em quantidade ou para empresas. Solicite uma cotação personalizada através de nossos canais de atendimento.'
    },
    open_box_definition: {
      keywords: ['open box', 'o que é open box', 'o que significa open box', 'open box é'],
      response: '<strong>Open Box</strong> refere-se a produtos cuja embalagem foi aberta, mas que permanecem novos e sem uso. São itens provenientes de devoluções ou trocas, rigorosamente testados e ofertados com desconto. Garantimos a procedência e qualidade.'
    },
    open_box_condition: {
      keywords: ['condição open box', 'como é um open box', 'estado open box', 'produto open box novo'],
      response: 'Produtos Open Box apresentam-se em perfeito estado de funcionamento, sendo considerados novos, porém com a embalagem aberta. Todos acompanham garantia de 3 meses e passam por inspeção técnica antes da venda.'
    },
    open_box_discount: {
      keywords: ['desconto open box', 'por que open box é mais barato', 'economia open box', 'quanto economizo'],
      response: 'Itens Open Box possuem descontos expressivos, variando entre <strong>20% e 35%</strong> em relação ao preço de varejo. Trata-se de uma excelente oportunidade para adquirir produtos novos por valores reduzidos.'
    },
    open_box_guarantee: {
      keywords: ['garantia open box', 'open box tem garantia', 'cobertura open box'],
      response: 'Todos os produtos Open Box contam com <strong>garantia de 3 meses</strong>, assegurando cobertura contra defeitos de fabricação. Prezamos pela sua segurança e tranquilidade na compra.'
    },
    open_box_risk: {
      keywords: ['risco open box', 'problema open box', 'open box quebrado', 'open box defeituoso'],
      response: 'Não há riscos adicionais na aquisição de produtos Open Box. Todos são testados e certificados antes da venda. Em caso de eventualidade, nossa garantia cobre qualquer defeito apresentado.'
    },
    open_box_vs_new: {
      keywords: ['open box vs novo', 'diferença open box novo', 'open box ou novo', 'qual diferença'],
      response: 'A principal diferença entre Open Box e produto novo é a embalagem aberta. O item permanece sem uso, com todas as funcionalidades preservadas, e é ofertado com desconto. Ambos contam com garantia.'
    },
    open_box_why: {
      keywords: ['por que open box', 'onde vem open box', 'origem open box', 'de onde vem'],
      response: 'Produtos Open Box são provenientes de devoluções, trocas ou cancelamentos, nos quais a embalagem foi aberta, mas o item não foi utilizado. São rigorosamente avaliados antes de serem disponibilizados para venda.'
    },
    open_box_availability: {
      keywords: ['estoque open box', 'abastecimento open box', 'entrada open box', 'produtos open box'],
      response: 'O estoque de produtos Open Box é limitado e variável. Para consultar disponibilidade de modelos específicos, sugerimos contato direto via WhatsApp.'
    },
    open_box_return: {
      keywords: ['devolver open box', 'troca open box', 'insatisfeito open box'],
      response: 'Caso não esteja satisfeito(a) com sua compra Open Box, é possível solicitar troca ou devolução em até 30 dias. Nossa política visa garantir sua plena satisfação.'
    },
    open_box_example: {
      keywords: ['exemplo open box', 'qual exemplo', 'vocês têm open box', 'que produtos'],
      response: 'Disponibilizamos Open Box em diversas categorias: smartphones, tablets, periféricos, monitores e outros. Consulte nossa seção específica para visualizar as opções disponíveis.'
    },
    gpu_questions: {
      keywords: ['RTX','quais rtx tem','tem RTX 2060','rtx 2060','rx 7600','rx 7700','rx 7800','rx 7900','rx 6600','rx 6700','rx 6800','rx 6900'],
      response: 'Temos algumas RTX e RX em estoque. Caso não ache o modelo, mande uma mensagem no zap (34) 99717-2028 para consultar disponibilidade.'
    },
    // add greeting entry (keeps compatibility)
    greeting: {
      keywords: ['bom dia', 'boa tarde', 'boa noite', 'boa madrugada', 'olá', 'ola', 'oi', 'e aí', 'ola jh', 'oi jh'],
      response: 'Olá! Como posso ajudar?'
    },
    // nova entry: perguntas por "mais dessa", "tem outra", etc.
    other_options: {
      keywords: [
        'mais dessa', 'tem outra', 'tem mais', 'tem mais dessa', 'tem outro', 'tem outros', 'outras opções',
        'outras cores', 'mais modelos', 'outras variações', 'outra unidade', 'mais em estoque', 'outra peça', 'mais desse modelo'
      ],
      response: 'Temos mais opções e modelos disponíveis. Para verificar disponibilidade em tempo real e ver alternativas, envie uma mensagem para nosso WhatsApp: <a href="https://wa.me/5534997172028" target="_blank">+55 34 99717-2028</a>. Responderemos o mais breve possível!'
    },
  };

  // Greeting detection: returns { greeting: 'Bom dia!', rest: '...' }
  function detectGreeting(text) {
    if (!text) return { greeting: null, rest: text };
    const q = text.toLowerCase();
    const mapping = {
      'bom dia': 'Bom dia!',
      'boa tarde': 'Boa tarde!',
      'boa noite': 'Boa noite!',
      'boa madrugada': 'Boa madrugada!',
      'olá': 'Olá!',
      'ola': 'Olá!',
      'oi': 'Olá!',
      'e aí': 'Olá!'
    };
    let match = null;
    for (const key of Object.keys(mapping)) {
      const idx = q.indexOf(key);
      if (idx !== -1) {
        if (match === null || idx < match.idx || (idx === match.idx && key.length > match.key.length)) {
          match = { key, idx, greeting: mapping[key] };
        }
      }
    }
    if (!match) return { greeting: null, rest: text };
    // remove matched greeting substring (case-insensitive) and clean punctuation
    const re = new RegExp(match.key, 'i');
    let rest = text.replace(re, '').trim();
    // strip leading punctuation and common separators
    rest = rest.replace(/^[\s.,;:!?-–—]+/, '').trim();
    return { greeting: match.greeting, rest };
  }

  function classifyQuestion(text) {
    const q = (text || '').toLowerCase().trim();
    if (!q) return { type: 'fallback', response: null };
    for (const [category, data] of Object.entries(knowledgeBase)) {
      for (const keyword of data.keywords) {
        if (q.includes(keyword)) {
          return { type: 'general', response: data.response };
        }
      }
    }
    return { type: 'product', response: null };
  }

  function searchProduct(text) {
    const q = (text || '').toLowerCase().trim();
    if (!q) return null;
    if (q.includes('lista') || q.includes('produtos') || q.includes('catalogo') || q.includes('catálogo')) {
      return { type: 'list', data: products.map(p => `${p.title} — ${p.price}`).join('<br/>') };
    }
    let best = null;
    let bestScore = 0;
    const tokens = q.split(/\s+/).filter(Boolean);
    products.forEach(p => {
      let score = 0;
      tokens.forEach(t => {
        if (p.title.toLowerCase().includes(t)) score += 3;
        if (p.desc.toLowerCase().includes(t)) score += 1;
        if ((t === 'preço' || t === 'valor' || t === 'quanto' || t === 'preco' || t === 'custa') && p.price) score += 2;
        if ((t === 'garantia' || t === 'garant') && p.desc.toLowerCase().includes('garant')) score += 2;
      });
      if (score > bestScore) {
        bestScore = score;
        best = p;
      }
    });

    if (best && bestScore > 2) {
      const snippet = best.desc.length > 180 ? best.desc.slice(0, 180) + '...' : best.desc;
      return { type: 'product', data: `<strong>${best.title}</strong><br/>${snippet}<br/><em>Preço:</em> ${best.price}` };
    }

    const substrMatch = products.filter(p => tokens.some(t => p.title.toLowerCase().includes(t)));
    if (substrMatch.length === 1) {
      const p = substrMatch[0];
      return { type: 'product', data: `<strong>${p.title}</strong><br/>${p.desc}<br/><em>Preço:</em> ${p.price}` };
    } else if (substrMatch.length > 1) {
      return { type: 'product', data: 'Encontrei vários produtos parecidos:<br/>' + substrMatch.map(p => `• ${p.title} — ${p.price}`).join('<br/>') };
    }

    return null;
  }

  function getBotReply(text) {
    // Detect greeting first and extract remaining user message
    const { greeting, rest } = detectGreeting(text || '');
    const query = (rest && rest.length > 0) ? rest : ''; // if rest empty, fallback to original

    if (greeting && !query) {
      // Just a greeting -> return cordial response
      return `${greeting} Como posso ajudar? 😊`;
    }

    // If greeting + other text, prefer to answer the rest, and combine responses
    const classification = classifyQuestion(query || text);
    if (classification.type === 'general' && classification.response) {
      const baseReply = classification.response;
      return greeting ? `${greeting} <br/> ${baseReply}` : baseReply;
    }

    const productSearch = searchProduct(query || text);
    if (productSearch) {
      const baseReply = productSearch.data;
      return greeting ? `${greeting} <br/> ${baseReply}` : baseReply;
    }

    // Fallback: if we have a greeting, combine with fallback suggestion
    if (greeting) {
      return `${greeting} <br/> Desculpe, não encontrei uma resposta exata. Tente:<br/>• Perguntar por um produto específico (ex: "Redmi Note 12")<br/>• Perguntar "lista de produtos"<br/>• Perguntar sobre contato, garantia, entrega ou pagamento<br/>ou use nosso WhatsApp para falar com um atendente! 😊`;
    }

    // Original fallback when no greeting detected
    return 'Desculpe, não encontrei uma resposta exata. Tente:<br/>• Perguntar por um produto específico (ex: "Redmi Note 12")<br/>• Perguntar "lista de produtos"<br/>• Perguntar sobre contato, garantia, entrega ou pagamento<br/>ou use nosso WhatsApp para falar com um atendente! 😊';
  }

  // SINGLE point: send handling & typing indicator
  async function sendMessage(text) {
    const t = text.trim();
    if (!t) return;
    appendMessage(t, 'user');
    aiInput.value = '';
    // show typing indicator while "thinking"
    const typingEl = showTypingIndicator();
    await new Promise(r => setTimeout(r, 430)); // simulated delay
    if (typingEl && typingEl.parentNode) typingEl.parentNode.removeChild(typingEl);
    const reply = getBotReply(t);
    appendMessage(reply, 'bot');
  }

  aiSendBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    sendMessage(aiInput.value);
  });

  aiInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage(aiInput.value);
    } else if (e.key === 'Escape') {
      aiInput.blur();
    }
  });

  // Open on ?chat=1 param
  if (location.search.includes('chat=1')) openPanel();
});