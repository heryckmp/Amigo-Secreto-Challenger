/**
 * Sistema de Animações Avançadas
 * Este arquivo gerencia todas as animações baseadas em viewport para elementos HTML.
 */

class AnimationsManager {
    constructor() {
        this.animatedElements = [];
        this.observers = [];
        this.initialized = false;
        
        // Opções padrão para IntersectionObserver
        this.defaultOptions = {
            threshold: 0.2,
            rootMargin: '0px 0px -10% 0px'
        };
        
        // Tipos de animação disponíveis
        this.animationTypes = {
            fadeIn: { duration: '1s', timing: 'ease-out' },
            fadeUp: { duration: '0.8s', timing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' },
            fadeLeft: { duration: '0.8s', timing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' },
            fadeRight: { duration: '0.8s', timing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' },
            scale: { duration: '0.7s', timing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' },
            pulse: { duration: '1s', timing: 'ease-in-out' },
            flipIn: { duration: '1.2s', timing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' },
            typewriter: { duration: '2s', timing: 'linear' }
        };
    }
    
    /**
     * Inicializa o sistema de animações
     */
    init() {
        if (this.initialized) return;
        
        // Adicionar estilos de animação ao document
        this.addAnimationStyles();
        
        // Inicializar observadores
        this.setupAnimations();
        
        this.initialized = true;
        console.log('Sistema de animações inicializado');
    }
    
    /**
     * Adiciona estilos CSS para as animações
     */
    addAnimationStyles() {
        if (document.getElementById('animation-styles')) return;
        
        const styleEl = document.createElement('style');
        styleEl.id = 'animation-styles';
        
        styleEl.textContent = `
            /* Animações básicas */
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes fadeUp {
                from { 
                    opacity: 0;
                    transform: translateY(30px);
                }
                to { 
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes fadeLeft {
                from { 
                    opacity: 0;
                    transform: translateX(-30px);
                }
                to { 
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes fadeRight {
                from { 
                    opacity: 0;
                    transform: translateX(30px);
                }
                to { 
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes scale {
                from { 
                    opacity: 0;
                    transform: scale(0.85);
                }
                to { 
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            
            @keyframes flipIn {
                from { 
                    opacity: 0;
                    transform: perspective(400px) rotateX(-90deg);
                    transform-origin: top;
                }
                to { 
                    opacity: 1;
                    transform: perspective(400px) rotateX(0);
                    transform-origin: top;
                }
            }
            
            /* Classe para elementos não animados ainda */
            .pre-animation {
                opacity: 0;
                will-change: transform, opacity;
            }
            
            /* Classe para quando está sendo animado */
            .animating {
                will-change: transform, opacity;
            }
        `;
        
        document.head.appendChild(styleEl);
    }
    
    /**
     * Configura as animações para elementos com data-animation
     */
    setupAnimations() {
        // Encontrar todos os elementos com atributos de animação
        const animatedElements = document.querySelectorAll('[data-animation]');
        this.animatedElements = Array.from(animatedElements);
        
        if (this.animatedElements.length === 0) {
            console.log('Nenhum elemento para animar encontrado');
            return;
        }
        
        console.log(`${this.animatedElements.length} elementos para animar encontrados`);
        
        // Adicionar classe pre-animation a todos os elementos
        this.animatedElements.forEach(element => {
            element.classList.add('pre-animation');
        });
        
        // Observar elementos
        this.observeElements();
    }
    
    /**
     * Observa quando elementos entram na viewport
     */
    observeElements() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    this.animateElement(element);
                    observer.unobserve(element);
                }
            });
        }, this.defaultOptions);
        
        this.animatedElements.forEach(element => {
            observer.observe(element);
        });
        
        this.observers.push(observer);
    }
    
    /**
     * Anima um elemento específico baseado em seus atributos data-*
     * @param {HTMLElement} element - O elemento a ser animado
     */
    animateElement(element) {
        const animationType = element.getAttribute('data-animation');
        const delay = element.getAttribute('data-delay') || 0;
        const duration = element.getAttribute('data-duration') || null;
        const timing = element.getAttribute('data-timing') || null;
        
        // Verificar se o tipo de animação é válido
        if (!this.animationTypes[animationType]) {
            console.warn(`Tipo de animação inválido: ${animationType}`);
            return;
        }
        
        // Remover classe de pré-animação
        element.classList.remove('pre-animation');
        element.classList.add('animating');
        
        // Atrasar animação se necessário
        setTimeout(() => {
            // Tratar animação typewriter de forma especial
            if (animationType === 'typewriter') {
                this.applyTypewriterEffect(element, duration);
                return;
            }
            
            // Configurar animação
            const animationConfig = this.animationTypes[animationType];
            const animDuration = duration || animationConfig.duration;
            const animTiming = timing || animationConfig.timing;
            
            element.style.animation = `${animationType} ${animDuration} ${animTiming} forwards`;
            
            // Limpar classes após animação
            element.addEventListener('animationend', () => {
                element.classList.remove('animating');
                element.style.opacity = '1';
            }, { once: true });
            
        }, delay * 1000);
    }
    
    /**
     * Aplica efeito de máquina de escrever ao elemento
     * @param {HTMLElement} element - O elemento para aplicar o efeito
     * @param {string} duration - Duração da animação
     */
    applyTypewriterEffect(element, duration) {
        const text = element.textContent;
        element.textContent = '';
        element.style.opacity = '1';
        
        const letters = text.split('');
        const typingSpeed = duration ? (parseFloat(duration) * 1000) / letters.length : 50;
        
        let i = 0;
        const interval = setInterval(() => {
            if (i < letters.length) {
                element.textContent += letters[i];
                i++;
            } else {
                clearInterval(interval);
                element.classList.remove('animating');
            }
        }, typingSpeed);
    }
    
    /**
     * Atualiza os observadores depois de adicionar/remover elementos do DOM
     */
    refresh() {
        // Remover observadores existentes
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        
        this.observers = [];
        this.animatedElements = [];
        
        // Configurar animações novamente
        this.setupAnimations();
    }
}

// Criar instância global
const animationsManager = new AnimationsManager();

// Inicializar ao carregar o DOM
document.addEventListener('DOMContentLoaded', () => {
    animationsManager.init();
});