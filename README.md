# Amigo Secreto - Sorteio Online

Este é um projeto simples de "Amigo Secreto" com uma interface de usuário para adicionar amigos e realizar o sorteio. Esse projeto faz parte do  curso **Iniciante em Programação - Turma G8**, do programa **Oracle Next Education (ONE)**

## Deploy

Você pode acessar o projeto em produção através do seguinte link:

[Amigo Secreto - Sorteio Online](https://amigo-secreto-challenger.vercel.app/)

## Funcionalidades

- **Adicionar amigos**: Permite que você adicione o nome dos participantes. - 
- **Remover amigos**: Você pode remover amigos da lista de participantes antes de realizar o sorteio.
- **Sortear amigo secreto**: Realiza o sorteio e exibe o nome do amigo sorteado.
- **Síntese de fala**: O resultado do sorteio é lido em voz alta usando a API de síntese de fala (Speech Synthesis) do navegador.
- **Validação**: Valida a entrada para garantir que os nomes sejam válidos (somente letras e espaços) e que não se repitam.
- **Visualizar a lista**: Exibe os nomes já adicionados.

- ## Validações Implementadas

- **Campo vazio**: Impede a adição de nomes em branco e espaços.
- **Tamanho mínimo**: O nome deve conter pelo menos 3 caracteres.
- **Validação de Nome com Caracteres Inválidos**: O código usa uma expressão regular (nomeValido) que permite apenas caracteres alfabéticos (de A a Z, incluindo letras com acentos) e espaços.
- **Duplicidade**: Nomes já adicionados não podem ser repetidos.
- **Quantidade mínima**: Sorteio só é permitido se houver pelo menos 5 amigos na lista.
- **Validação de Voz**: Quando o sorteio de um amigo secreto é realizado, o nome sorteado é lido em voz alta,
- **Validação de Voz em Alertas**: Caso o sorteio não possa ser realizado (por exemplo, se houver menos de 5 participantes), uma mensagem de alerta é lida em voz alta para reforçar a comunicação com o usuário e
- a acessibilidade.
  


## Tecnologias Utilizadas

- **HTML5**: Estrutura da página.
- **CSS3**: Estilização da interface com responsividade.
- **JavaScript**: Lógica para adicionar/remover amigos, sortear e usar a síntese de fala.
- **Speech Synthesis API**: Para ler em voz alta o nome do amigo sorteado.

## Como Contribuir

1. **Fork** este repositório.
2. Crie uma branch para suas alterações (git checkout -b nome-da-branch).
3. Faça suas alterações e adicione testes, se necessário.
4. Envie suas alterações (git push origin nome-da-branch).
5. Abra um **pull request** explicando suas alterações.

