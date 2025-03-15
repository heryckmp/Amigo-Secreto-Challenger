/**
 * Sistema de Parallax
 * Gerencia efeitos de parallax para elementos HTML com base na posição do scroll
 */

class ParallaxManager {
    constructor() {
        this.parallaxElements = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;
        this.scrollY = window.scrollY;
        this.ticking = false;
        this.initialized = false;
        
        // Configurações padrão
        this.defaultSettings = {
            intensity: 0.1,  // Intensidade do efeito (0-1)
            direction: 'up', // Direção: up, down, left, right
            mouseReact: false // Reagir ao movimento do mouse
        };
    }
    
    /**
     * Inicializa o sistema de parallax
     */
    init() {
        if (this.initialized) return;
        
        // Encontrar todos os elementos com data-parallax
        this.findParallaxElements();
        
        // Adicionar event listeners
        window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
        window.addEventListener('resize', this.handleResize.bind(this), { passive: true });
        window.addEventListener('mousemove', this.handleMouseMove.bind(this), { passive: true });
        
        // Aplicar efeito inicial
        this.updateElements();
        
        this.initialized = true;
        console.log('Sistema de parallax inicializado');
    }
    
    /**
     * Encontra todos os elementos com atributo data-parallax
     */
    findParallaxElements() {
        const elements = document.querySelectorAll('[data-parallax]');
        this.parallaxElements = Array.from(elements).map(element => {
            return {
                element,
                // Obter configurações do elemento
                settings: this.getElementSettings(element),
                // Guardar posição original
                originalTransform: window.getComputedStyle(element).transform === 'none' 
                    ? '' 
                    : window.getComputedStyle(element).transform
            };
        });
        
        console.log(`${this.parallaxElements.length} elementos parallax encontrados`);
    }
    
    /**
     * Obtém configurações específicas para o elemento a partir de data-attributes
     * @param {HTMLElement} element - O elemento com configurações
     * @returns {Object} Configurações mescladas
     */
    getElementSettings(element) {
        const settings = { ...this.defaultSettings };
        
        // Obter intensidade
        if (element.hasAttribute('data-parallax-intensity')) {
            settings.intensity = parseFloat(element.getAttribute('data-parallax-intensity'));
        }
        
        // Obter direção
        if (element.hasAttribute('data-parallax-direction')) {
            const direction = element.getAttribute('data-parallax-direction');
            if (['up', 'down', 'left', 'right'].includes(direction)) {
                settings.direction = direction;
            }
        }
        
        // Verificar se reage ao mouse
        if (element.hasAttribute('data-parallax-mouse')) {
            settings.mouseReact = element.getAttribute('data-parallax-mouse') === 'true';
        }
        
        return settings;
    }
    
    /**
     * Manipula evento de scroll
     */
    handleScroll() {
        this.scrollY = window.scrollY;
        this.requestUpdate();
    }
    
    /**
     * Manipula evento de redimensionamento da janela
     */
    handleResize() {
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;
        this.requestUpdate();
    }
    
    /**
     * Manipula movimento do mouse
     * @param {MouseEvent} event - Evento de movimento do mouse
     */
    handleMouseMove(event) {
        // Normalizar posição do mouse (de 0 a 1)
        this.mouseX = event.clientX / this.windowWidth;
        this.mouseY = event.clientY / this.windowHeight;
        this.requestUpdate();
    }
    
    /**
     * Solicita atualização de animação usando requestAnimationFrame
     */
    requestUpdate() {
        if (!this.ticking) {
            window.requestAnimationFrame(() => {
                this.updateElements();
                this.ticking = false;
            });
            this.ticking = true;
        }
    }
    
    /**
     * Atualiza todos os elementos parallax
     */
    updateElements() {
        this.parallaxElements.forEach(item => {
            const { element, settings, originalTransform } = item;
            
            // Verificar se o elemento está visível na viewport
            if (this.isElementInViewport(element)) {
                // Calcular deslocamento baseado em scroll
                const scrollOffset = this.calculateScrollOffset(element, settings);
                
                // Calcular deslocamento baseado em mouse (se habilitado)
                const mouseOffset = settings.mouseReact ? this.calculateMouseOffset(settings) : { x: 0, y: 0 };
                
                // Aplicar transformação
                const translateX = scrollOffset.x + mouseOffset.x;
                const translateY = scrollOffset.y + mouseOffset.y;
                
                // Aplicar efeito de parallax preservando transformações originais
                element.style.transform = `${originalTransform} translate3d(${translateX}px, ${translateY}px, 0)`;
                element.style.willChange = 'transform';
            }
        });
    }
    
    /**
     * Calcula o deslocamento baseado na posição de scroll
     * @param {HTMLElement} element - O elemento
     * @param {Object} settings - Configurações do elemento
     * @returns {Object} Deslocamento X e Y
     */
    calculateScrollOffset(element, settings) {
        const rect = element.getBoundingClientRect();
        const elementMiddleY = rect.top + rect.height / 2;
        
        // Distância do elemento ao centro da viewport (normalizada de -1 a 1)
        const distanceFromCenter = (elementMiddleY - this.windowHeight / 2) / (this.windowHeight / 2);
        
        // Calcular deslocamento com base na direção
        let offsetX = 0;
        let offsetY = 0;
        
        const intensity = settings.intensity * 100; // Convertendo para pixels mais perceptíveis
        
        switch (settings.direction) {
            case 'up':
                offsetY = distanceFromCenter * intensity;
                break;
            case 'down':
                offsetY = -distanceFromCenter * intensity;
                break;
            case 'left':
                offsetX = distanceFromCenter * intensity;
                break;
            case 'right':
                offsetX = -distanceFromCenter * intensity;
                break;
        }
        
        return { x: offsetX, y: offsetY };
    }
    
    /**
     * Calcula o deslocamento baseado na posição do mouse
     * @param {Object} settings - Configurações do elemento
     * @returns {Object} Deslocamento X e Y
     */
    calculateMouseOffset(settings) {
        // Normalizar valores do mouse de -1 a 1
        const normalizedX = this.mouseX * 2 - 1;
        const normalizedY = this.mouseY * 2 - 1;
        
        // Calcular deslocamento
        const intensity = settings.intensity * 20; // Fator de escala
        
        return {
            x: normalizedX * intensity,
            y: normalizedY * intensity
        };
    }
    
    /**
     * Verifica se o elemento está visível na viewport
     * @param {HTMLElement} element - O elemento a verificar
     * @returns {boolean} Verdadeiro se visível
     */
    isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        
        return (
            rect.top < (this.windowHeight + 100) &&
            rect.bottom > -100 &&
            rect.left < (this.windowWidth + 100) &&
            rect.right > -100
        );
    }
    
    /**
     * Atualiza os elementos após alterações no DOM
     */
    refresh() {
        this.findParallaxElements();
        this.updateElements();
    }
    
    /**
     * Destroi o manager, removendo event listeners
     */
    destroy() {
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('mousemove', this.handleMouseMove);
        
        // Resetar transformações
        this.parallaxElements.forEach(item => {
            item.element.style.transform = item.originalTransform;
            item.element.style.willChange = '';
        });
        
        this.initialized = false;
    }
}

// Criar instância global
const parallaxManager = new ParallaxManager();

// Inicializar ao carregar o DOM
document.addEventListener('DOMContentLoaded', () => {
    parallaxManager.init();
});