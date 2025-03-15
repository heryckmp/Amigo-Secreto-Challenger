/**
 * Sistema de Parallax para Landing Page do Amigo Secreto
 * Este arquivo implementa o efeito de parallax para diferentes elementos durante o scroll
 */

class ParallaxManager {
    constructor() {
        // Elementos com parallax
        this.parallaxElements = [];
        
        // Estado do scroll
        this.scrollY = 0;
        this.lastScrollY = 0;
        this.scrollDirection = 0;
        
        // Window height para cálculos
        this.windowHeight = window.innerHeight;
        
        // Flag de inicialização
        this.initialized = false;
        
        // Configurações
        this.lerp = 0.1; // Linear interpolation para suavizar o movimento
    }
    
    /**
     * Inicializa o gerenciador de parallax
     */
    init() {
        if (this.initialized) return;
        
        // Detectar elementos com parallax
        this.detectParallaxElements();
        
        // Iniciar listeners de eventos
        this.setupEventListeners();
        
        // Marcar como inicializado
        this.initialized = true;
    }
    
    /**
     * Detecta elementos com atributos de parallax
     */
    detectParallaxElements() {
        // Buscar elementos que usam data-parallax
        const elements = document.querySelectorAll('[data-parallax]');
        
        elements.forEach(element => {
            // Obter valores dos atributos de parallax (se não existir, usar valor padrão)
            const depth = parseFloat(element.dataset.parallaxDepth || 0.2);
            const direction = element.dataset.parallaxDirection || 'vertical';
            const scale = element.dataset.parallaxScale ? 
                          parseFloat(element.dataset.parallaxScale) : null;
            const rotation = element.dataset.parallaxRotation ? 
                            parseFloat(element.dataset.parallaxRotation) : null;
            
            // Checar se o elemento está dentro de uma seção específica
            const section = element.closest('.section');
            
            // Salvar posição inicial e dimensões
            const rect = element.getBoundingClientRect();
            const startPosition = {
                x: rect.left,
                y: rect.top + window.scrollY
            };
            
            // Posição atual será inicializada igual à inicial
            const currentPosition = { ...startPosition };
            
            // Adicionar à lista de elementos com parallax
            this.parallaxElements.push({
                element,
                depth,
                direction,
                scale,
                rotation,
                section,
                startPosition,
                currentPosition,
                initialTransform: window.getComputedStyle(element).transform
            });
        });
    }
    
    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Listener para scroll
        window.addEventListener('scroll', this.handleScroll.bind(this));
        
        // Listener para resize
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Iniciar loop de animação
        requestAnimationFrame(this.animate.bind(this));
    }
    
    /**
     * Manipula evento de scroll
     */
    handleScroll() {
        // Atualiza posição e direção do scroll
        this.scrollY = window.scrollY;
        this.scrollDirection = this.scrollY > this.lastScrollY ? 1 : -1;
    }
    
    /**
     * Manipula evento de resize
     */
    handleResize() {
        // Atualiza altura da janela
        this.windowHeight = window.innerHeight;
        
        // Recalcular posições iniciais dos elementos
        this.parallaxElements.forEach(item => {
            const rect = item.element.getBoundingClientRect();
            item.startPosition = {
                x: rect.left,
                y: rect.top + window.scrollY
            };
        });
    }
    
    /**
     * Verifica se um elemento está visível na viewport
     */
    isElementVisible(item) {
        const rect = item.element.getBoundingClientRect();
        
        // Margens para a verificação (para começar um pouco antes/depois da viewport)
        const margin = this.windowHeight * 0.5;
        
        // Verificar se está dentro da área visível + margem
        return (
            rect.bottom + margin > 0 &&
            rect.top - margin < this.windowHeight
        );
    }
    
    /**
     * Calcula e aplica o efeito de parallax aos elementos
     */
    updateParallaxPositions() {
        this.parallaxElements.forEach(item => {
            // Verificar se o elemento está visível
            if (!this.isElementVisible(item)) return;
            
            // Calcular a posição relativa do elemento na viewport (0 a 1)
            const rect = item.element.getBoundingClientRect();
            const sectionRect = item.section ? 
                               item.section.getBoundingClientRect() : 
                               { top: 0, height: this.windowHeight };
            
            // Posição do elemento em relação à seção (ou viewport se não tiver seção)
            const relativePos = (rect.top - sectionRect.top) / sectionRect.height;
            
            // Calcular offset de parallax com base na profundidade e posição
            let offsetX = 0;
            let offsetY = 0;
            let offsetScale = 1;
            let offsetRotation = 0;
            
            // O efeito de parallax é aplicado de forma diferente dependendo da direção
            if (item.direction === 'vertical' || item.direction === 'both') {
                // Movimento na vertical - baseado na posição relativa na seção
                offsetY = (relativePos - 0.5) * item.depth * 100;
            }
            
            if (item.direction === 'horizontal' || item.direction === 'both') {
                // Movimento na horizontal - baseado na posição do scroll
                offsetX = this.scrollY * item.depth * 0.1 * this.scrollDirection;
            }
            
            // Efeito de escala, se especificado
            if (item.scale !== null) {
                offsetScale = 1 + (relativePos - 0.5) * item.scale * 0.2;
            }
            
            // Efeito de rotação, se especificado
            if (item.rotation !== null) {
                offsetRotation = (relativePos - 0.5) * item.rotation;
            }
            
            // Aplicar transformação com LERP para suavizar
            this.applyParallaxToElement(item, offsetX, offsetY, offsetScale, offsetRotation);
        });
    }
    
    /**
     * Aplica a transformação de parallax a um elemento
     */
    applyParallaxToElement(item, offsetX, offsetY, scale, rotation) {
        // Interpolar os valores atuais com os novos valores (LERP)
        item.currentPosition.x = item.startPosition.x + offsetX;
        item.currentPosition.y = item.startPosition.y + offsetY;
        
        // Construir a string de transformação CSS
        let transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
        
        // Adicionar escala se necessário
        if (scale !== 1) {
            transform += ` scale(${scale})`;
        }
        
        // Adicionar rotação se necessário
        if (rotation !== 0) {
            transform += ` rotate(${rotation}deg)`;
        }
        
        // Aplicar transformação
        item.element.style.transform = transform;
    }
    
    /**
     * Loop de animação para atualizar as posições de parallax
     */
    animate() {
        // Atualizar posições de parallax
        this.updateParallaxPositions();
        
        // Salvar última posição de scroll
        this.lastScrollY = this.scrollY;
        
        // Continuar o loop de animação
        requestAnimationFrame(this.animate.bind(this));
    }
    
    /**
     * Adiciona um novo elemento para efeito de parallax
     */
    addElement(element, options = {}) {
        const depth = options.depth || 0.2;
        const direction = options.direction || 'vertical';
        const scale = options.scale || null;
        const rotation = options.rotation || null;
        
        // Encontrar seção parente
        const section = element.closest('.section');
        
        // Posição inicial
        const rect = element.getBoundingClientRect();
        const startPosition = {
            x: rect.left,
            y: rect.top + window.scrollY
        };
        
        // Adicionar à lista
        this.parallaxElements.push({
            element,
            depth,
            direction,
            scale,
            rotation,
            section,
            startPosition,
            currentPosition: { ...startPosition },
            initialTransform: window.getComputedStyle(element).transform
        });
    }
    
    /**
     * Remove um elemento da lista de parallax
     */
    removeElement(element) {
        const index = this.parallaxElements.findIndex(item => item.element === element);
        
        if (index !== -1) {
            // Restaurar transformação original
            const item = this.parallaxElements[index];
            item.element.style.transform = item.initialTransform;
            
            // Remover da lista
            this.parallaxElements.splice(index, 1);
        }
    }
}

// Criar instância global
const parallaxManager = new ParallaxManager();