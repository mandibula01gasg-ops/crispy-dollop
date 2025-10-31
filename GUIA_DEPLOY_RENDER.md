# 🚀 Guia Completo de Deploy no Render.com

**Última atualização**: 30 de Outubro de 2025

## 🆕 Changelog (Novidades)

### Versão 2.0 - 30/10/2025
- ✅ **PIX via Pagou.ai configurado e funcional** - QR Codes PIX sendo gerados corretamente
- ✅ **Correção do bug "$NaN"** - Valor total do pedido agora exibe corretamente
- ✅ **Endpoint `/api/orders/:id` corrigido** - Retorna dados de PIX (QR Code) junto com o pedido
- ✅ **Instruções de configuração de IP** - Guia completo para liberar acesso ao MySQL da Hostinger
- ✅ **Variável PAGOUAI_API_KEY obrigatória** - Necessária para processar pagamentos PIX reais

## 📋 Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Configuração no GitHub](#configuração-no-github)
3. [Criação do Serviço no Render](#criação-do-serviço-no-render)
4. [Configuração das Variáveis de Ambiente](#configuração-das-variáveis-de-ambiente)
5. [Deploy e Verificação](#deploy-e-verificação)
6. [Configuração do Domínio Personalizado](#configuração-do-domínio-personalizado)
7. [Manutenção e Troubleshooting](#manutenção-e-troubleshooting)

---

## ✅ Pré-requisitos

Antes de começar, certifique-se de ter:

- ✅ Conta no GitHub (gratuita)
- ✅ Conta no Render.com (gratuita - **NÃO precisa de cartão de crédito**)
- ✅ Banco de dados MySQL na Hostinger já configurado
- ✅ Credenciais do banco de dados MySQL (host, porta, usuário, senha, nome do banco)
- ✅ Conta no Pagou.ai configurada com API key (para pagamentos PIX)

---

## 📦 1. Configuração no GitHub

### Passo 1.1: Criar Repositório no GitHub

1. Acesse [github.com](https://github.com) e faça login
2. Clique no botão **"New"** ou **"Novo repositório"**
3. Configure o repositório:
   - **Nome**: `acai-prime` (ou o nome que preferir)
   - **Visibilidade**: Público ou Privado (ambos funcionam no Render)
   - **Descrição**: "Site de vendas de açaí - Açaí Prime"
4. Clique em **"Create repository"**

### Passo 1.2: Fazer Push do Código

Se você está no Replit:

```bash
# Inicializar git (se ainda não estiver inicializado)
git init

# Adicionar remote do GitHub
git remote add origin https://github.com/SEU_USUARIO/acai-prime.git

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Deploy inicial - Açaí Prime"

# Fazer push para o GitHub
git push -u origin main
```

**Nota**: Se o branch principal for `master` ao invés de `main`, use `git push -u origin master`

---

## 🌐 2. Criação do Serviço no Render

### Passo 2.1: Acessar o Render

1. Acesse [render.com](https://render.com)
2. Clique em **"Get Started for Free"**
3. Faça cadastro/login usando sua conta do GitHub

### Passo 2.2: Conectar o Repositório

1. No painel do Render, clique em **"New +"** no canto superior direito
2. Selecione **"Web Service"**
3. Escolha **"Build and deploy from a Git repository"**
4. Clique em **"Connect"** ao lado do GitHub
5. Autorize o Render a acessar seus repositórios
6. Procure e selecione o repositório **`acai-prime`**

### Passo 2.3: Configurar o Serviço

Configure as seguintes opções:

| Campo | Valor |
|-------|-------|
| **Name** | `acai-prime` (ou nome único de sua escolha) |
| **Region** | `Frankfurt (EU Central)` ou `Ohio (US East)` (escolha o mais próximo do Brasil) |
| **Branch** | `main` (ou `master`, dependendo do seu repositório) |
| **Root Directory** | *deixe em branco* |
| **Runtime** | **Node** |
| **Build Command** | `npm install --include=dev && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | **Free** (plano gratuito) |

**IMPORTANTE**: No plano gratuito, o serviço "dorme" após 15 minutos de inatividade e acorda automaticamente quando alguém acessa.

---

## 🔐 3. Configuração das Variáveis de Ambiente

### Passo 3.1: Acessar Environment Variables

1. Ainda na página de configuração do serviço (antes de clicar em "Create Web Service")
2. Role até a seção **"Environment Variables"** ou **"Advanced"**
3. Clique em **"Add Environment Variable"**

### Passo 3.2: Adicionar Variáveis do Banco de Dados MySQL

Adicione as seguintes variáveis **UMA POR UMA**:

#### Variável 1: MYSQL_HOST
- **Key**: `MYSQL_HOST`
- **Value**: `srv886.hstgr.io` (ou o endereço do seu servidor MySQL da Hostinger)

#### Variável 2: MYSQL_PORT
- **Key**: `MYSQL_PORT`
- **Value**: `3306` (porta padrão do MySQL)

#### Variável 3: MYSQL_USER
- **Key**: `MYSQL_USER`
- **Value**: Seu usuário do banco de dados (exemplo: `u123456789_acai`)

#### Variável 4: MYSQL_PASSWORD
- **Key**: `MYSQL_PASSWORD`
- **Value**: Sua senha do banco de dados MySQL

#### Variável 5: MYSQL_DATABASE
- **Key**: `MYSQL_DATABASE`
- **Value**: Nome do seu banco de dados (exemplo: `u123456789_acai`)

### Passo 3.3: Adicionar Variável de Sessão (IMPORTANTE!)

#### Variável 6: SESSION_SECRET
- **Key**: `SESSION_SECRET`
- **Value**: Uma string aleatória e segura (exemplo: `minha-chave-super-secreta-123456-acai-prime-2025`)

**DICA**: Gere uma chave forte usando um gerador online ou criando uma senha complexa.

### Passo 3.4: Adicionar Variável NODE_ENV

#### Variável 7: NODE_ENV
- **Key**: `NODE_ENV`
- **Value**: `production`

### Passo 3.5: Adicionar Pagou.ai (PIX) - OBRIGATÓRIO

Para processar pagamentos PIX via Pagou.ai:

#### Variável 8: PAGOUAI_API_KEY
- **Key**: `PAGOUAI_API_KEY`
- **Value**: Sua chave de API do Pagou.ai (obtida em https://conta.pagou.ai)

**IMPORTANTE**: Sem essa chave, os pagamentos PIX não funcionarão corretamente! O sistema gerará QR Codes mock apenas para demonstração.

### Passo 3.6: (Opcional) Mercado Pago

Se você também quiser aceitar cartão de crédito via Mercado Pago:

#### Variável 9: MERCADO_PAGO_ACCESS_TOKEN
- **Key**: `MERCADO_PAGO_ACCESS_TOKEN`
- **Value**: Seu token de acesso do Mercado Pago

#### Variável 10: VITE_MERCADO_PAGO_PUBLIC_KEY
- **Key**: `VITE_MERCADO_PAGO_PUBLIC_KEY`
- **Value**: Sua chave pública do Mercado Pago

**Nota**: O Pagou.ai (PIX) funciona independentemente do Mercado Pago.

---

## 🎯 4. Deploy e Verificação

### Passo 4.1: Iniciar o Deploy

1. Após adicionar todas as variáveis de ambiente, role até o final da página
2. Clique no botão **"Create Web Service"**
3. O Render começará automaticamente o processo de deploy

### Passo 4.2: Acompanhar o Deploy

1. Você será redirecionado para a página do serviço
2. Na aba **"Logs"**, você verá o progresso do deploy em tempo real
3. O processo completo leva aproximadamente **5-10 minutos**

**Etapas do deploy**:
- ⏳ Clonando repositório do GitHub
- ⏳ Instalando dependências (`npm install`)
- ⏳ Compilando o código (`npm run build`)
- ⏳ Iniciando o servidor (`npm start`)
- ✅ Deploy concluído!

### Passo 4.3: Primeiro Acesso

1. Quando o deploy terminar, você verá a mensagem: **"Your service is live 🎉"**
2. O Render fornecerá uma URL pública no formato: `https://acai-prime.onrender.com`
3. Clique nessa URL ou copie e cole no navegador

**IMPORTANTE - Primeiro Acesso**: Na primeira vez, o site pode levar **30-60 segundos** para carregar (o serviço está "acordando"). Nas próximas visitas será mais rápido.

### Passo 4.4: Verificar Funcionalidades

Teste as seguintes funcionalidades:

1. ✅ Página inicial carrega corretamente
2. ✅ Produtos aparecem na tela
3. ✅ Carrinho funciona
4. ✅ Acesso admin: `https://sua-url.onrender.com/admin`
   - Email: `admin@acaiprime.com`
   - Senha: `admin123`

---

## 🌐 5. Configuração do Domínio Personalizado

### Passo 5.1: Ter um Domínio

Você precisa de um domínio próprio. Opções populares:
- **Registro.br** (domínios .br) - R$ 40/ano
- **Hostinger** (vários TLDs) - a partir de R$ 20/ano
- **GoDaddy** (vários TLDs)
- **Namecheap** (domínios internacionais baratos)

### Passo 5.2: Adicionar Domínio no Render

1. No painel do Render, vá para o seu serviço **acai-prime**
2. Clique na aba **"Settings"**
3. Role até a seção **"Custom Domain"**
4. Clique em **"Add Custom Domain"**
5. Digite seu domínio (exemplo: `acaiprime.com.br` ou `www.acaiprime.com.br`)
6. Clique em **"Save"**

### Passo 5.3: Configurar DNS

O Render fornecerá instruções específicas. Geralmente você precisa adicionar um dos seguintes registros DNS:

**Opção A - Domínio Raiz (exemplo.com)**:
- Tipo: `A` ou `CNAME`
- Nome: `@` ou deixe em branco
- Valor: IP fornecido pelo Render ou `acai-prime.onrender.com`

**Opção B - Subdomínio (www.exemplo.com)**:
- Tipo: `CNAME`
- Nome: `www`
- Valor: `acai-prime.onrender.com`

### Passo 5.4: Aguardar Propagação

- A propagação DNS pode levar de **15 minutos a 48 horas**
- O Render automaticamente emitirá um **certificado SSL gratuito** (HTTPS)
- Quando estiver pronto, seu site estará disponível em `https://seudominio.com.br`

---

## 🛠️ 6. Manutenção e Troubleshooting

### Como Atualizar o Site

Sempre que você fizer alterações no código:

```bash
# No Replit ou no seu computador
git add .
git commit -m "Descrição das mudanças"
git push origin main
```

O Render detecta automaticamente os pushes no GitHub e **faz deploy automaticamente** (Auto-Deploy).

### Desativar Auto-Deploy (Opcional)

Se quiser controlar quando fazer deploy:

1. Vá em **Settings** → **Build & Deploy**
2. Desative **"Auto-Deploy"**
3. Para fazer deploy manual, clique em **"Manual Deploy" → "Deploy latest commit"**

### Ver Logs de Erro

1. No painel do Render, clique no seu serviço
2. Vá para a aba **"Logs"**
3. Veja os logs em tempo real para identificar problemas

### Reiniciar o Serviço

Se o site estiver com problemas:

1. Clique em **"Manual Deploy"**
2. Selecione **"Clear build cache & deploy"**

### Problemas Comuns

#### ❌ Site retorna erro 500

**Solução**: Verifique se todas as variáveis de ambiente foram configuradas corretamente, especialmente as credenciais do MySQL.

#### ❌ Site mostra "Service Unavailable"

**Solução**: O serviço pode estar dormindo (plano free). Aguarde 30-60 segundos que ele acorda automaticamente.

#### ❌ Banco de dados não conecta

**Solução**:
1. Verifique se o IP do Render está autorizado no MySQL da Hostinger
2. Na Hostinger, vá em **hPanel → Bancos de Dados MySQL → Gerenciamento Remoto do MySQL**
3. Adicione **TODOS** os IPs que o Render pode usar:
   - Clique em "Adicionar Host Remoto"
   - Adicione: `%` (permite qualquer IP - mais fácil mas menos seguro)
   - **OU** adicione os IPs específicos do Render para sua região (consulte a documentação do Render)
   
**DICA IMPORTANTE**: O Render pode usar diferentes IPs a cada deploy. A opção `%` é recomendada para evitar problemas de conexão.

**Para Replit**: Se você está testando no Replit antes do deploy, também precisa adicionar o IP do Replit:
1. Execute `curl ifconfig.me` no terminal do Replit para ver o IP atual
2. Adicione esse IP no MySQL da Hostinger

#### ❌ Admin não funciona

**Solução**: Você precisa popular o usuário admin inicial. Acesse via terminal do Render ou faça via API:

```bash
curl -X POST https://sua-url.onrender.com/api/seed-admin
```

Isso criará o usuário:
- Email: `admin@acaiprime.com`
- Senha: `admin123`

**IMPORTANTE**: Altere essa senha em produção!

---

## 🔒 Dicas de Segurança

### 1. Alterar Senha do Admin

Após o primeiro deploy:

1. Acesse `/admin`
2. Faça login com `admin@acaiprime.com` / `admin123`
3. **Crie um novo usuário admin** com senha forte
4. Delete o usuário padrão (ou altere a senha dele manualmente no banco)

### 2. SESSION_SECRET Forte

Use uma chave longa e aleatória para `SESSION_SECRET`. Exemplo:
```
8f3h2k9dj4s7a1m6p0q5z2x8c7v3b9n4m1k
```

### 3. Backup do Banco de Dados

Faça backups regulares do MySQL na Hostinger:

1. Acesse o **phpMyAdmin** na Hostinger
2. Selecione seu banco de dados
3. Clique em **"Exportar"**
4. Faça download do arquivo `.sql`

---

## 📊 Monitoramento

### Verificar Status do Serviço

No painel do Render:
- **Events**: Veja histórico de deploys
- **Logs**: Monitore erros em tempo real  
- **Metrics**: Veja uso de memória e CPU (plano pago)

### Notificações

Configure notificações:
1. Vá em **Settings**
2. Configure **"Notifications"**
3. Adicione seu email para receber alertas de falhas

---

## 💰 Custos

### Plano Free (Gratuito)

O que está incluído **SEM CUSTO**:
- ✅ 750 horas de uso por mês (suficiente para um site 24/7)
- ✅ SSL/HTTPS automático e gratuito
- ✅ Deploy automático via GitHub
- ✅ Domínio personalizado
- ✅ 512 MB de RAM

**Limitações**:
- ⏸️ Serviço "dorme" após 15 minutos sem acesso
- ⏸️ Demora 30-60s para "acordar"
- 📊 Largura de banda limitada (100 GB/mês)

### Upgrade para Plano Pago (Opcional)

Se quiser que o site **nunca durma** e seja mais rápido:

**Starter Plan**: US$ 7/mês
- ✅ Serviço sempre ativo (nunca dorme)
- ✅ 512 MB de RAM
- ✅ Largura de banda maior

**Standard Plan**: US$ 25/mês
- ✅ 2 GB de RAM
- ✅ Alta performance
- ✅ Suporte prioritário

---

## ✅ Checklist Final

Antes de considerar o deploy completo, verifique:

- [x] Site abre corretamente em `https://sua-url.onrender.com`
- [x] Produtos aparecem na página inicial
- [x] Carrinho funciona
- [x] Página de checkout funciona
- [x] Admin acessível em `/admin`
- [x] Dashboard do admin mostra dados (pedidos, analytics)
- [x] Gerenciamento de produtos funciona (criar, editar, deletar)
- [x] Upload de imagens funciona
- [x] Banco de dados conectado (pedidos são salvos)
- [x] (Opcional) Domínio personalizado configurado
- [x] (Opcional) Mercado Pago configurado

---

## 🆘 Suporte

### Documentação Oficial

- **Render**: https://render.com/docs
- **Node.js no Render**: https://render.com/docs/deploy-node-express-app

### Comunidade

- **Render Community**: https://community.render.com
- **Stack Overflow**: Tag `render.com`

---

## 🎉 Parabéns!

Seu site **Açaí Prime** está no ar! 🍇🚀

Próximos passos sugeridos:
1. ✅ Popular produtos via painel admin
2. ✅ Adicionar avaliações de clientes
3. ✅ Configurar Mercado Pago para pagamentos reais
4. ✅ Promover nas redes sociais

**Boa sorte com suas vendas de açaí! 🍇💜**
