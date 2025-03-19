# 🎁 Amigo Secreto

Um aplicativo web moderno para realizar sorteios de amigo secreto, com interface interativa, efeitos visuais 3D e design responsivo.

![Amigo Secreto](https://img.shields.io/badge/Amigo_Secreto-v1.0-8A2BE2)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Three.js](https://img.shields.io/badge/Three.js-000000?logo=three.js&logoColor=white)

## ✨ Recursos

- 🎁 **Presente 3D Interativo**: Um modelo 3D de presente que reage ao movimento do mouse.
- ❄️ **Efeito de Neve Interativo**: Sistema de partículas 3D que reage aos movimentos do cursor.
- 🎨 **Design Glassmorphism**: Interface moderna com efeitos de vidro.
- 🎉 **Animações de Confete**: Celebre o resultado do sorteio com confetes animados.
- 📱 **Responsivo**: Funciona em dispositivos móveis e desktops.
- 💾 **Armazenamento Local**: Salva os participantes no navegador.
- 🌟 **Animações de UI**: Elementos que aparecem com animações suaves.

## 🚀 Como Usar

1. Abra a aplicação em seu navegador.
2. Adicione os nomes dos participantes (mínimo 3).
3. Clique no botão "Realizar Sorteio".
4. O sistema sorteará aleatoriamente os pares para o amigo secreto.
5. Ao mostrar cada resultado, interação com o presente 3D e efeitos visuais celebram o momento.

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura da aplicação.
- **CSS3**: Estilização moderna com glassmorphism e animações.
- **JavaScript**: Lógica da aplicação e interatividade.
- **Three.js**: Renderização de elementos 3D (neve e presente).
- **GSAP**: Biblioteca para animações avançadas.
- **Intersection Observer API**: Para animações acionadas ao visualizar elementos.

## 🎮 Interatividade

- **Presente 3D**: O presente no centro da aplicação reage ao movimento do mouse, girando suavemente. Durante eventos importantes como adicionar participantes ou realizar sorteio, o presente executa animações especiais.

- **Sistema de Neve**: As partículas de neve reagem ao movimento do cursor, criando um efeito de "vento" que afasta os flocos. A neve serve como um background interativo que adiciona profundidade à experiência.

- **Elementos UI**: Botões e elementos da interface utilizam efeitos glassmorphism que reagem a interações do usuário com animações sutis de hover e clique.

## 🔧 Personalização

Você pode personalizar vários aspectos da aplicação:

### Cores e Temas

As variáveis CSS no arquivo `style.css` permitem alterar facilmente o esquema de cores:

```css
:root {
    /* Cores principais */
    --color-primary: #8A2BE2;
    --color-secondary: #9370DB;
    --color-accent: #BA55D3;
    --color-background: #13111A;
    --color-background-gradient: #1E1931;
    --color-text: #FFFFFF;
    /* ... outras variáveis ... */
}
```

### Sistema de Neve

Para ajustar o sistema de neve, modifique parâmetros no arquivo `snow-system.js`:

- Aumente ou diminua a quantidade de partículas ajustando o parâmetro `amount` no construtor.
- Altere a interatividade modificando os valores de `mouseStrength`.
- Mude o tamanho das partículas através do atributo `sizes` na inicialização.

### Modelo 3D

Para personalizar o presente 3D, edite o arquivo `present-model.js`:

- Altere as cores do presente e da fita modificando os materiais.
- Ajuste o tamanho base definindo um valor diferente para `originalPresentSize`.
- Modifique a velocidade de rotação na função de animação.

## 👥 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para:

- Reportar bugs
- Sugerir novas funcionalidades
- Enviar pull requests

## 📝 Licença

Este projeto está licenciado sob a MIT License.