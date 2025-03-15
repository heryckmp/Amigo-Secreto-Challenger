/**
 * Sistema de Animações para Landing Page do Amigo Secreto
 * Este arquivo gerencia as animações de elementos quando entram na viewport
 */

class AnimationManager {
    constructor() {
        // Configurações
        this.animatedElements = [];
        this.observerThreshold = 0.2; // Porcentagem do elemento que deve estar visível
        this.observerMargin = '-10% 0px'; // Margem para trigger
        this.initialized = false;
        
        // Tipos de animação disponíveis
        this.animationTypes = {
            fadeUp: {
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }
            },
            fadeIn: {
                hidden: { opacity: 0 },
                visible: { opacity: 1, duration: 1, ease: "power2.out" }
            },
            scaleUp: {
                hidden: { opacity: 0, scale: 0.8 },
                visible: { opacity: 1, scale: 1, duration: 1, ease: "back.out(1.5)" }
            },
            slideRight: {
                hidden: { opacity: 0, x: -50 },
                visible: { opacity: 1, x: 0, duration: 0.8, ease: "power2.out" }
            },
            slideLeft: {
                hidden: { opacity: 0, x: 50 },
                visible: { opacity: 1, x: 0, duration: 0.8, ease: "power2.out" }
            },
            rotate: {
                hidden: { opacity: 0, rotation: -15, scale: 0.8 },
                visible: { opacity: 1, rotation: 0, scale: 1, duration: 1.3, ease: "elastic.out(1, 0.5)" }
            },
            typewriter: {
                setup: (element) => {
                    // Salvar o texto original
                    const originalText = element.textContent;
                    element.dataset.originalText = originalText;
                    element.textContent = "";
                    element.style.visibility = "visible";
                    return originalText;
                },
                animate: (element) => {
                    const originalText = element.dataset.originalText;
                    const textLength = originalText.length;
                    
                    // Criar timeline para animação de digitação
                    const tl = gsap.timeline();
                    
                    // Digitar caractere por caractere
                    tl.to(element, {
                        duration: 0.1 * textLength, // Duração baseada no número de caracteres
                        text: originalText,
                        ease: "none"
                    });
                    
                    return tl;
                }
            },
            splitText: {
                setup: (element) => {
                    // Divide o texto em caracteres
                    const text = element.textContent;
                    const chars = text.split("");
                    element.innerHTML = "";
                    
                    // Cria um span para cada caractere
                    chars.forEach(char => {
                        const span = document.createElement('span');
                        span.textContent = char === " " ? "\u00A0" : char; // Espaço não-quebrável para espaços
                        span.style.display = "inline-block";
                        span.style.opacity = "0";
                        element.appendChild(span);
                    });
                    
                    return Array.from(element.children);
                },
                animate: (element, spans) => {
                    // Anima cada caractere com um pequeno atraso entre eles
                    return gsap.to(spans, {
                        opacity: 1,
                        y: 0,
                        stagger: 0.05,
                        duration: 0.6,
                        ease: "back.out(1.7)",
                        onStart: () => {
                            element.style.visibility = "visible";
                        }
                    });
                }
            }
        };
    }
    
    /**
     * Inicializa o gerenciador de animações
     */
    init() {
        if (this.initialized) return;
        
        // Configurar o observador de intersecção para detectar elementos na viewport
        this.setupIntersectionObserver();
        
        // Preparar elementos com data-animation
        this.prepareElements();
        
        this.initialized = true;
    }
    
    /**
     * Configura o observador de interseção para detectar elementos na viewport
     */
    setupIntersectionObserver() {
        const options = {
            root: null, // viewport
            rootMargin: this.observerMargin,
            threshold: this.observerThreshold
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                    // Parar de observar após animar, para que a animação ocorra apenas uma vez
                    this.observer.unobserve(entry.target);
                }
            });
        }, options);
    }
    
    /**
     * Prepara os elementos com atributos data-animation
     */
    prepareElements() {
        // Seleciona todos os elementos com atributo data-animation
        const elements = document.querySelectorAll('[data-animation]');
        
        elements.forEach(element => {
            // Obtém o tipo de animação do atributo
            const animationType = element.dataset.animation;
            const delay = parseFloat(element.dataset.delay || 0);
            
            // Verifica se o tipo de animação existe
            if (this.animationTypes[animationType]) {
                // Configuração especial para alguns tipos de animação
                let extraData = null;
                
                if (animationType === 'typewriter') {
                    extraData = this.animationTypes[animationType].setup(element);
                } else if (animationType === 'splitText') {
                    extraData = this.animationTypes[animationType].setup(element);
                } else {
                    // Define o estado inicial escondido para os outros tipos de animação
                    gsap.set(element, this.animationTypes[animationType].hidden);
                }
                
                // Adiciona à lista de elementos para animação
                this.animatedElements.push({
                    element: element,
                    type: animationType,
                    animated: false,
                    delay: delay,
                    extraData: extraData
                });
                
                // Adiciona ao observador
                this.observer.observe(element);
                
                // Inicialmente esconde o elemento (exceto para tipos especiais já tratados)
                if (!['typewriter', 'splitText'].includes(animationType)) {
                    element.style.visibility = "hidden";
                }
            }
        });
    }
    
    /**
     * Anima um elemento quando ele se torna visível
     */
    animateElement(element) {
        // Encontra o elemento nos registrados
        const animData = this.animatedElements.find(item => item.element === element);
        
        if (animData && !animData.animated) {
            const animType = this.animationTypes[animData.type];
            
            // Marca como animado
            animData.animated = true;
            
            // Torna o elemento visível
            element.style.visibility = "visible";
            
            // Tipos especiais de animação
            if (animData.type === 'typewriter') {
                setTimeout(() => {
                    animType.animate(element);
                }, animData.delay * 1000);
            } else if (animData.type === 'splitText') {
                setTimeout(() => {
                    animType.animate(element, animData.extraData);
                }, animData.delay * 1000);
            } else {
                // Animações padrão baseadas em GSAP
                gsap.to(element, {
                    ...animType.visible,
                    delay: animData.delay
                });
            }
        }
    }
    
    /**
     * Reseta as animações para que possam rodar novamente
     */
    resetAnimations() {
        this.animatedElements.forEach(animData => {
            const element = animData.element;
            const animType = this.animationTypes[animData.type];
            
            // Reseta para o estado inicial
            if (animData.type === 'typewriter') {
                element.textContent = "";
            } else if (animData.type === 'splitText') {
                // Reseta cada caractere
                Array.from(element.children).forEach(span => {
                    gsap.set(span, { opacity: 0, y: 20 });
                });
            } else {
                gsap.set(element, animType.hidden);
            }
            
            // Marca como não animado
            animData.animated = false;
            
            // Esconde o elemento
            element.style.visibility = "hidden";
            
            // Observa novamente
            this.observer.observe(element);
        });
    }
}

// Criar instância global
const animationManager = new AnimationManager();