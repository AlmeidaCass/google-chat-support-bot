/**
 * Google Chat Bot - Suporte TI Simples (Versão 11.0 - Híbrido: DM + Grupos)
 * Autor: Especialista Google Workspace
 */

// 🚨 MANTENHA SUA URL AQUI
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxvzL5fHImW-R8vz69E4ug4nE4e5uS5En3Wz2-oZ4sZnPgv-v-OcdZQsQOhwJ6O0jiR/exec"; 

// --- Função ponte para HTTP ---
function doGet(e) {
  if (e.parameter && e.parameter.redirect) {
    const targetUrl = e.parameter.redirect;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Google Sans', Roboto, Arial, sans-serif; text-align: center; padding-top: 60px; background-color: #f8f9fa; color: #202124; }
            .container { max-width: 500px; margin: 0 auto; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15); }
            h2 { font-size: 22px; margin-bottom: 20px; }
            p { color: #5f6368; margin-bottom: 30px; }
            .btn { display: inline-block; background-color: #1a73e8; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: 500; font-size: 16px; transition: background-color 0.3s; }
            .btn:hover { background-color: #1765cc; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Acessar Sistema Interno</h2>
            <p>Por motivos de segurança, confirme o acesso ao sistema abaixo:</p>
            <p><strong>${targetUrl}</strong></p>
            <a href="${targetUrl}" target="_top" class="btn">Acessar Sistema Agora</a>
          </div>
          <script>
            window.onload = function() { window.top.location.href = "${targetUrl}"; };
          </script>
        </body>
      </html>
    `;
    return HtmlService.createHtmlOutput(html).setTitle("Redirecionando...").setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  return ContentService.createTextOutput("Bot Ativo.");
}

function doPost(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return ContentService.createTextOutput("");
  }

  const event = JSON.parse(e.postData.contents);
  let replyData = {};
  let query = "";

  // --- LÓGICA DE EXTRAÇÃO HÍBRIDA (Grupo vs DM) ---
  
  if (event.type === "MESSAGE") {
    // Se for em Grupo (Space), o Google manda o texto limpo em 'argumentText' (sem o @NomeDoBot)
    // Se for DM, usamos o 'text' normal
    if (event.message.argumentText) {
      query = event.message.argumentText.trim();
    } else {
      query = event.message.text || "";
    }
  } 
  else if (event.type === "CARD_CLICKED") {
    let rawParams = null;
    if (event.commonEventObject && event.commonEventObject.parameters) {
      rawParams = event.commonEventObject.parameters;
    } 
    else if (event.action && event.action.parameters) {
      rawParams = event.action.parameters;
    }

    if (rawParams) {
      if (rawParams.query) {
        query = rawParams.query;
      } else if (Array.isArray(rawParams)) {
        const foundParam = rawParams.find(p => p.key === "query");
        if (foundParam) query = foundParam.value;
      }
    }
  }

  // --- INTERAÇÃO EM GRUPO: Boas-vindas ao ser adicionado ---
  if (event.type === "ADDED_TO_SPACE" && event.space.type === "ROOM") {
    return ContentService.createTextOutput(JSON.stringify({
      "text": "Olá equipe! 👋 Eu sou o Assistente de TI.\nPara falar comigo, basta me marcar e digitar o comando.\nExemplo: *@Suporte TI menu*"
    })).setMimeType(ContentService.MimeType.JSON);
  }

  replyData = respondToLogic(query);

  if (event.type === "CARD_CLICKED") {
    if (replyData.cardsV2) {
      replyData.actionResponse = { "type": "UPDATE_MESSAGE" };
    } else if (replyData.text) {
      replyData.actionResponse = { "type": "NEW_MESSAGE" };
    }
  }

  return ContentService.createTextOutput(JSON.stringify(replyData))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Lógica Central
 */
function respondToLogic(inputText) {
  const text = inputText ? inputText.toLowerCase() : "";

  // Se o usuário marcou o bot mas não digitou nada (Ex: "@Assistente TI"), mostramos o menu
  if (text === "") {
    return createMainMenu();
  }

  if (text.includes("menu_sistemas")) {
    return createSystemsMenu();
  }

  if (text.includes("menu") || text.includes("início") || text.includes("ajuda")) {
    return createMainMenu();
  }

  // --- SEUS TEXTOS PERSONALIZADOS ---

  if (text.includes("senha")) {
    return sendText("🔐 *Para problemas de senha:*\n\nSe o seu usuário for bloqueado, aguarde 5 minutos. \n\nPara resetar, use o atalho CTRL + ALT + DEL e selecionar a opção 'alterar a senha'. \n\nSe nenhuma das opções funcionar abra um chamado .");
  }

  if (text.includes("impressora")) {
    return sendText("🖨️ *Sobre a Impressora:*\n\nVerifique se o papel A4 acabou. \n\nSe houver atolamento, não puxe o papel com força, abra a tampa frontal, remova com cuidado qualquer papel preso, faça o mesmo com a tampa traseira. \n\nSe o problema persistir abra um chamado.");
  }

  if (text.includes("internet")) {
    return sendText("🌐 *Sem Internet?*\n\nReinicie o WIFI. \n\nVerifique se está conectado na rede correta 'CORPORATIVO'.\n\nSe Possível reinicie o computador. \n\nCaso nenhuma das alternativas funcione abra um chamado.");
  }

  if (text.includes("humano")) {
    return sendText("👤 *Atendimento Humano*\n\nEntendido! Um técnico visualizará sua mensagem em breve.");
  }

  // Fallback seguro: Se não entendeu o comando, mostra o menu
  return createMainMenu();
}

/**
 * MENU PRINCIPAL (SEM BOTÃO HUMANO)
 */
function createMainMenu() {
  return {
    "cardsV2": [{
      "cardId": "menu-principal",
      "card": {
        "header": {
          "title": "🤖 Assistente TI",
          "subtitle": "Como posso ajudar hoje?",
          "imageUrl": "https://www.gstatic.com/images/branding/product/2x/chat_48dp.png",
          "imageType": "CIRCLE"
        },
        "sections": [
          {
            "header": "Dúvidas Comuns",
            "widgets": [
              {
                "buttonList": {
                  "buttons": [
                    { "text": "🔑 Senha", "onClick": { "action": { "function": "doPost", "parameters": [{ "key": "query", "value": "senha" }] } } },
                    { "text": "🖨️ Impressora", "onClick": { "action": { "function": "doPost", "parameters": [{ "key": "query", "value": "impressora" }] } } },
                    { "text": "🌐 Internet", "onClick": { "action": { "function": "doPost", "parameters": [{ "key": "query", "value": "internet" }] } } }
                  ]
                }
              }
            ]
          },
          {
            "header": "Acesso Rápido",
            "widgets": [
              {
                "buttonList": {
                  "buttons": [
                    {
                      "text": "💻 Sistemas Internos",
                      "onClick": { "action": { "function": "doPost", "parameters": [{ "key": "query", "value": "menu_sistemas" }] } }
                    },
                    {
                      "text": "📝 Abrir Chamado",
                      "icon": { "knownIcon": "TICKET" },
                      "onClick": { "openLink": { "url": "https://chamados.intranet.coppead.ufrj.br/ServiceCatalog" } }
                    }
                  ]
                }
              }
            ]
          }
        ]
      }
    }]
  };
}

/**
 * NOVO MENU DE SISTEMAS
 */
function createSystemsMenu() {
  const baseUrl = (WEB_APP_URL.includes("http")) ? WEB_APP_URL : "https://script.google.com/macros/s/ERRO_URL_NAO_CONFIGURADA/exec";
  
  return {
    "cardsV2": [{
      "cardId": "menu-sistemas",
      "card": {
        "header": { "title": "💻 Sistemas Internos" },
        "sections": [{
          "widgets": [
            {
              "textParagraph": { "text": "Selecione o sistema que deseja acessar:" }
            },
            {
              "buttonList": {
                "buttons": [
                  {
                    "text": "🔗 Autônomo",
                    "onClick": { "openLink": { "url": baseUrl + "?redirect=" + encodeURIComponent("http://autonomo:8089/autonomo-web") } }
                  },
                  {
                    "text": "🔗 Estoque",
                    "onClick": { "openLink": { "url": baseUrl + "?redirect=" + encodeURIComponent("http://estoque:8089/estoque-web") } }
                  },
                  {
                    "text": "🔗 Orçamento",
                    "onClick": { "openLink": { "url": baseUrl + "?redirect=" + encodeURIComponent("http://orcamento:8089/orcamento-web") } }
                  }
                ]
              }
            },
            { "divider": {} },
            {
              "buttonList": {
                "buttons": [
                  { 
                    "text": "🔙 Voltar ao Início", 
                    "onClick": { "action": { "function": "doPost", "parameters": [{ "key": "query", "value": "menu" }] } } 
                  }
                ]
              }
            }
          ]
        }]
      }
    }]
  };
}

function sendText(text) {
  return { "text": text };
}