# Carrinho, pedidos, login, frete e contato — Marks Imports

## O que o cliente vai ver
- **Carrinho**: botão "Adicionar ao carrinho" em cada produto (com cor/tamanho escolhidos), ícone de carrinho no topo com contador, gaveta lateral para mudar quantidade ou remover.
- **Faixa de aviso**: "Frete grátis acima de R$ 420" no topo e no carrinho, com barra "faltam R$ X para frete grátis".
- **Login**: entrar com Google ou com e-mail e senha.
- **Ficha de cadastro** (página "Minha conta"): nome, e-mail, telefone, CEP, rua, número, complemento, bairro, cidade, estado. O endereço é preenchido automaticamente pelo CEP.
- **Finalizar pedido**: exige login e cadastro completo; mostra itens, subtotal, frete e total. Acima de R$ 420 frete grátis; abaixo, cálculo automático pelo CEP (opções PAC/SEDEX).
- Ao finalizar: gera **número de orçamento aleatório** (ex.: MK-7F3K9Q), salva o pedido, mostra tela de confirmação e envia **e-mail para marksimportssp@gmail.com** com cliente, itens, frete e total.
- **Balão do WhatsApp** flutuante no canto da tela, em todas as páginas.
- **Página Fale Conosco**: e-mail, WhatsApp e formulário (nome, e-mail, telefone, assunto: Dúvida / Orçamento / Troca e devolução / Pedido / Outro, mensagem). Mensagem salva e enviada por e-mail para a Marks Imports.

## O que vou precisar de você
1. **Frete automático**: conta gratuita no **Melhor Envio** e a chave de acesso (vou explicar passo a passo). Até lá o frete abaixo de R$ 420 aparece como "a calcular" e o pedido segue normalmente.
2. **E-mail**: para enviar e-mails é preciso configurar um domínio de envio (ex.: marksimports.com.br). Vou abrir a tela de configuração; sem isso os pedidos ficam salvos mas o e-mail não sai.
3. **CEP de origem** (de onde saem os envios) e medidas/peso padrão do pacote.

## Observação
O ZIP do GitHub Pages não terá essas funções (precisa de servidor). O site com carrinho fica no ar pelo Lovable com o seu domínio.

## Detalhes técnicos
- Ativar Lovable Cloud; auth e-mail/senha + Google.
- Tabelas: `profiles` (dados de cadastro, RLS por usuário, trigger na criação), `orders` (numero único, itens jsonb, subtotal, frete, total, user_id), `contact_messages` (insert público).
- Carrinho em estado cliente com persistência local (contexto React).
- Rotas: `/auth`, `/_authenticated/conta`, `/_authenticated/checkout`, `/pedido/$numero` (autenticada), `/contato`.
- Server functions: `calcularFrete` (Melhor Envio, secret `MELHOR_ENVIO_TOKEN`), `criarPedido` (requireSupabaseAuth, gera número aleatório, recalcula preços no servidor a partir dos dados de produto, envia e-mail), `enviarContato`.
- CEP via ViaCEP. E-mails transacionais via infraestrutura de e-mail do Lovable.
