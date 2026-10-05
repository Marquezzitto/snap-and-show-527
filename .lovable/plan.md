# Painel completo de produtos da Marks Imports

## Objetivo
Deixar no login proprietário uma área clara para administrar os itens da loja sem precisar alterar arquivos manualmente.

## O que será feito
- Transformar cada produto do painel em uma edição visível, com botões claros para **Editar**, **Fotos e vídeos**, **Estoque** e **Excluir/reativar**.
- Permitir alterar nome, descrição, preço e disponibilidade do item.
- Permitir adicionar, excluir e restaurar fotos, além de escolher a foto exibida para cada cor.
- Permitir enviar e excluir vídeos curtos do produto, com limites e formatos informados na tela.
- Tratar “excluir produto” com segurança: itens originais serão ocultados da loja e poderão ser reativados, preservando pedidos antigos.
- Manter todas essas ações exclusivas da conta administradora já configurada.

## Detalhes técnicos
- Ampliar os ajustes protegidos do catálogo para guardar vídeos vinculados ao produto.
- Reutilizar o armazenamento protegido atual e autorizar apenas arquivos de imagem ou vídeo dentro dos limites definidos.
- Exibir vídeos na página do produto junto à galeria, sem interferir nas fotos por cor.
- Manter a validação do preço durante a compra para evitar divergências entre produto, carrinho e pedido.

## Validação
- Entrar como proprietária e testar edição de texto e preço.
- Enviar e excluir uma foto e um vídeo de teste.
- Ocultar e reativar um produto.
- Confirmar no celular e no computador que as alterações aparecem na loja e não quebram carrinho nem pedido.
