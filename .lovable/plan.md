# E-mail da loja via Resend — orçamentos e Fale Conosco chegam em marksimportssp@gmail.com

## Passo 1 — Agora, no Registro.br (a tela que você está vendo)

Na área **Configurar zona DNS**, clique em **Nova Entrada** e adicione os 4 registros que o Resend mostra, um de cada vez:

1. **DKIM** — Tipo: `TXT` · Nome: `resend._domainkey` · Valor: aquele texto longo que começa com `p=MIGfMA...` (clique no campo Content do Resend para copiar o valor COMPLETO)
2. **SPF 1** — Tipo: `CNAME` · Nome: `resend` · Valor: o endereço `resend-sa.[...]mta.net` (o seu valor exclusivo da tela)
3. **SPF 2** — Tipo: `CNAME` · Nome: `send` · Valor: o endereço `send.for.[...]mta.net`
4. **DMARC** — Tipo: `TXT` · Nome: `_dmarc` · Valor: `v=DMARC1; p=none;`

Depois clique em **SALVAR ALTERAÇÕES** no Registro.br.

## Passo 2 — Avisar o Resend

De volta à tela do Resend, clique no botão preto **"I've added the records"** e aguarde alguns minutos até o domínio aparecer como **Verified**.

## Passo 3 — Criar a chave e colocar na Vercel

1. No Resend: menu **API Keys** → **Create API Key** → copie a chave (começa com `re_`).
2. Na Vercel: **Settings → Environment Variables** → nova variável: Nome `RESEND_API_KEY`, valor = a chave copiada → Save.
3. Aba **Deployments** → nos três pontinhos do último deploy → **Redeploy**.

## Passo 4 — Eu atualizo o código (a parte que faço aqui)

- Ativar o envio real de e-mail no lugar do aviso provisório: os e-mails de **orçamento** e do **Fale Conosco** passam a sair de verdade, pelo seu domínio (`noreply@marksimports.com.br`) e chegam em `marksimportssp@gmail.com`.
- Publico a alteração; o GitHub sincroniza e a Vercel atualiza o site sozinha.

## Passo 5 — Teste final

Fazer um pedido de teste: conferir número do orçamento (MK-XXXXXX), frete pelo CEP e a chegada do e-mail na sua caixa.
