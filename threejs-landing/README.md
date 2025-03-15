# Landing Page Interativa com Three.js - Amigo Secreto

Este projeto é uma landing page interativa para o aplicativo "Amigo Secreto", desenvolvida com Three.js para criar uma experiência imersiva e visualmente impressionante similar ao site de referência [Campo alle Comete](https://www.campoallecomete.it/#!/en).

![Preview da Landing Page](https://i.imgur.com/sample-image.png)

## 🚀 Características

- **Experiência 3D Imersiva**: Visualização 3D com partículas interativas que reagem ao movimento do mouse
- **Design Moderno**: Interface minimalista e elegante com animações suaves
- **Responsivo**: Funciona perfeitamente em todos os dispositivos
- **Navegação por Seções**: Transições suaves entre as diferentes seções da página
- **Efeitos Visuais**: Elementos 3D que mudam de comportamento conforme o usuário navega

## 🛠️ Tecnologias Utilizadas

- **Three.js**: Biblioteca para criação de gráficos 3D no navegador
- **GSAP (GreenSock Animation Platform)**: Para animações avançadas e transições
- **HTML5 & CSS3**: Estrutura e estilização responsiva
- **JavaScript**: Programação da interatividade e efeitos

## 📋 Estrutura do Projeto

```
threejs-landing/
├── css/
│   └── style.css     # Estilos da landing page
├── js/
│   └── app.js        # Lógica JavaScript e configuração do Three.js
├── index.html        # Estrutura HTML da landing page
└── README.md         # Documentação
```

## 🔍 Como Funciona

### Efeito de Partículas 3D

A landing page cria um sistema de partículas 3D usando Three.js que se move e reage à navegação e interações do usuário:

1. **Partículas Interativas**: Respondem ao movimento do mouse, criando um efeito de profundidade
2. **Mudança de Comportamento**: As partículas mudam seu comportamento de acordo com a seção ativa
3. **Animações Fluidas**: Transições suaves entre estados visuais diferentes

### Navegação por Seções

A página utiliza uma navegação de seção única com transições suaves:

1. **Detecção de Scroll**: A seção atual é detectada com base na posição do scroll
2. **Navegação Intuitiva**: Os links do menu levam o usuário suavemente para a seção correspondente
3. **Feedback Visual**: A seção ativa recebe destaque visual no menu e no conteúdo

## 🎨 Customização

Você pode personalizar vários aspectos da landing page:

### Cores e Temas

As cores principais são definidas como variáveis CSS em `style.css`:

```css
:root {
    --color-primary: #8A2BE2;
    --color-secondary: #9370DB;
    --color-accent: #BA55D3;
    --color-dark: #0D1117;
    --color-light: #F8F9FA;
    /* ... */
}
```

### Comportamento das Partículas

As propriedades das partículas 3D podem ser ajustadas no arquivo `app.js`:

```javascript
// Alterar número de partículas
for (let i = 0; i < 200; i++) { ... }

// Alterar cores
const colors = [
    new THREE.Color(0x8A2BE2),
    new THREE.Color(0x9370DB),
    new THREE.Color(0xBA55D3)
];
```

## 📱 Responsividade

A landing page é totalmente responsiva e se adapta a diferentes tamanhos de tela:

- **Desktop**: Exibição completa com todas as animações
- **Tablet**: Layout ajustado para melhor experiência em telas médias
- **Mobile**: Menu colapsável e otimizações para tela pequena

## 🚀 Como Usar

1. Clone este repositório:
   ```
   git clone https://github.com/heryckmp/Amigo-Secreto-Challenger.git
   ```

2. Navegue até a pasta da landing page:
   ```
   cd Amigo-Secreto-Challenger/threejs-landing
   ```

3. Abra o arquivo `index.html` em seu navegador ou use um servidor local (como o Live Server do VSCode)

## 📚 Recursos Utilizados

- [Three.js Documentation](https://threejs.org/docs/)
- [GSAP Documentation](https://greensock.com/docs/)
- [Campo alle Comete](https://www.campoallecomete.it/#!/en) - Site de referência para design

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests com melhorias.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

Desenvolvido por [Heryck Moreira](https://github.com/heryckmp)