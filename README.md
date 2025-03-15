# Amigo Secreto - Sorteio Online

Este é um projeto de "Amigo Secreto" com uma interface de usuário moderna para adicionar amigos e realizar o sorteio. Esse projeto faz parte do curso **Iniciante em Programação - Turma G8**, do programa **Oracle Next Education (ONE)**.

![Exemplo de Amigo Secreto](assets/amigo-secret.png)

## Deploy

Você pode acessar o projeto em produção através do seguinte link:

[Amigo Secreto - Sorteio Online](https://amigo-secreto-challenger.vercel.app/)

## Funcionalidades

- **Adicionar amigos**: Permite que você adicione o nome dos participantes
- **Remover amigos**: Você pode remover amigos da lista de participantes antes de realizar o sorteio
- **Sortear amigo secreto**: Realiza o sorteio com uma animação visual e exibe o nome do amigo sorteado
- **Síntese de fala**: O resultado do sorteio é lido em voz alta usando a API de síntese de fala do navegador
- **Validação**: Valida a entrada para garantir que os nomes sejam válidos e que não se repitam
- **Design responsivo**: Interface adaptável para diversos tamanhos de tela
- **Acessibilidade**: Elementos interativos com suporte a navegação por teclado e leitores de tela

## Validações Implementadas

- **Campo vazio**: Impede a adição de nomes em branco
- **Tamanho mínimo**: O nome deve conter pelo menos 3 caracteres
- **Validação de caracteres**: Utiliza expressão regular para permitir apenas caracteres alfabéticos e espaços
- **Duplicidade**: Nomes já adicionados não podem ser repetidos
- **Quantidade mínima**: Sorteio só é permitido se houver pelo menos 5 amigos na lista
- **Feedback visual e sonoro**: Mensagens de sucesso ou erro são destacadas visualmente e lidas em voz alta

## Melhorias Recentes

- **Interface moderna**: Design atualizado com animações suaves e transições
- **Animação de sorteio**: Efeito visual durante o sorteio para melhor experiência
- **Responsividade aprimorada**: Adaptação perfeita para dispositivos móveis, tablets e desktops
- **Acessibilidade**: Melhorias na navegação por teclado e compatibilidade com leitores de tela
- **Feedback ao usuário**: Mensagens claras de sucesso e erro com feedback visual e sonoro
- **Performance**: Código otimizado para carregar rapidamente e funcionar em diversos dispositivos

## Tecnologias Utilizadas

- **HTML5**: Estrutura semântica da página
- **CSS3**: Estilização moderna com:
  - Variáveis CSS para consistência visual
  - Flexbox para layouts responsivos
  - Animações e transições para uma experiência interativa
  - Media queries para responsividade
- **JavaScript**: Lógica para adicionar/remover amigos, sortear e usar a síntese de fala
- **Web APIs**:
  - Speech Synthesis API para feedback por voz
  - DOM API para manipulação dinâmica do conteúdo

## Como Contribuir

1. **Fork** este repositório
2. Crie uma branch para suas alterações (`git checkout -b nome-da-branch`)
3. Faça suas alterações e adicione testes, se necessário
4. Envie suas alterações (`git push origin nome-da-branch`)
5. Abra um **pull request** explicando suas alterações

## Próximos Passos

- Implementar um modo escuro/claro
- Adicionar opção para exportar a lista de sorteios
- Criar grupos de amigo secreto para gerenciar múltiplos sorteios
- Adicionar persistência local para salvar listas de participantes