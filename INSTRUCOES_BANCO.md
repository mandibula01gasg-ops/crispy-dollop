# Instruções para Liberar Acesso ao Banco de Dados MySQL (Hostinger)

## Problema Atual
O servidor está tentando conectar ao banco de dados, mas está recebendo erro de acesso:
```
Access denied for user 'u512039343_SKL'@'34.168.5.32' (using password: YES)
```

## IP que precisa ser liberado
- **IP do Replit**: `34.168.5.32`
- **IP do Render**: Você precisará verificar qual é o IP do Render no momento do deploy

## Como Liberar o Acesso no Hostinger

1. Acesse o painel do Hostinger (https://hpanel.hostinger.com)
2. Vá em **Bancos de Dados** > **MySQL**
3. Selecione o banco de dados `u512039343_SKL`
4. Procure pela seção **Hosts Remotos** ou **Remote MySQL**
5. Adicione o IP: `34.168.5.32`
6. **IMPORTANTE**: Alguns provedores exigem o formato com wildcard `34.168.5.%` (todos os IPs começando com 34.168.5)
7. Salve as alterações
8. **Aguarde 2-5 minutos** para a alteração propagar

## Testando a Conexão

Depois de liberar o IP, você pode testar:

1. Aqui no Replit, o site deverá carregar os produtos automaticamente
2. O painel admin em `/admin/login` deverá funcionar

## Credenciais Atuais (já configuradas)
- **Host**: Verificado nas variáveis de ambiente
- **Porta**: Verificada nas variáveis de ambiente  
- **Usuário**: u512039343_SKL
- **Banco**: Verificado nas variáveis de ambiente

## Se ainda não funcionar

1. Verifique se o banco de dados está ativo no Hostinger
2. Tente liberar o wildcard `%` (todos os IPs) temporariamente para teste
3. Verifique se as credenciais estão corretas no painel do Hostinger
4. Entre em contato com o suporte do Hostinger para confirmar o IP permitido

## Para o Deploy no Render

Quando você fizer o deploy no Render, precisará:
1. Obter o IP do servidor Render (pode ser dinâmico)
2. Liberar esse IP no Hostinger também
3. Ou usar um IP range que cubra os IPs do Render

**Dica**: Alguns hosts permitem usar `%` como wildcard para liberar todos os IPs, mas isso pode ser um risco de segurança se não houver outra proteção.
