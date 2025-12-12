🤖 Google Chat Support Bot (Serverless via Apps Script)

Um Chatbot corporativo leve e eficiente para Google Chat, desenvolvido para atuar como primeiro nível de suporte de TI (N1).

Este projeto utiliza Google Apps Script como backend serverless e a Google Chat API via Webhooks, eliminando a necessidade de servidores externos ou custos adicionais de infraestrutura.

🎯 Funcionalidades

Menu Interativo (Cards V2): Interface visual com botões para navegação rápida.

Suporte Híbrido (DM + Grupos):

Mensagem Direta: Responde a comandos diretos.

Grupos (Spaces): Responde apenas quando mencionado (@NomeDoBot), garantindo privacidade e evitando spam.

Redirecionador Seguro (HTTP Bridge): Solução inteligente para permitir acesso a sistemas legados internos (HTTP) dentro do ambiente seguro (HTTPS) do Google Chat, utilizando um "bouncer" em HTML.

Links Externos: Integração direta com sistemas de abertura de chamados.

Respostas Automáticas: Base de conhecimento simples para problemas comuns (Senha, Impressora, Internet).

🛠️ Arquitetura

O bot opera no modelo Webhook:

O usuário interage no Google Chat.

O Google Cloud envia um payload JSON para o Web App do Apps Script.

O script processa a intenção (texto, clique ou menção) e retorna um JSON formatado como Card V2.

🚀 Como Implantar (Deploy)

Pré-requisitos

Conta Google Workspace.

Acesso ao Google Cloud Console (para ativar a API).

Passo 1: Google Apps Script

Crie um novo projeto em script.google.com.

Copie o conteúdo de Code.gs deste repositório.

Publique como App da Web:

Executar como: Eu

Quem pode acessar: Qualquer pessoa (Necessário para o Webhook do Google funcionar).

Copie a URL gerada (/exec) e atualize a constante WEB_APP_URL no código.

Passo 2: Google Cloud Platform (GCP)

No Console GCP, ative a Google Chat API.

Em Configuração, defina:

Nome/Avatar do Bot.

Connection Settings: Selecione "HTTP Endpoint" e cole a URL do seu Web App.

Interactive Features: Habilite "Receive 1:1 messages" e "Join spaces and group conversations".

Em Visibilidade, adicione seu e-mail ou grupo do Google Workspace para testes.

💡 Destaque Técnico: O Redirecionador HTTP

O Google Chat bloqueia conteúdo misto (sites HTTP dentro de iframes HTTPS). Para contornar isso e acessar sistemas legados internos (Intranet/ERP), este bot implementa uma função doGet() que serve uma página intermediária com window.top.location.href, garantindo o redirecionamento seguro fora do iframe do chat.

// Exemplo da lógica de ponte
function doGet(e) {
  if (e.parameter.redirect) {
    // Renderiza HTML com target="_top" para quebrar o iframe
    window.top.location.href = targetUrl;
  }
}


📄 Licença

Este projeto é de código aberto e destinado a fins educacionais e corporativos internos.