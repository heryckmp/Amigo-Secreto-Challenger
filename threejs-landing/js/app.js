/**
 * Amigo Secreto - Landing Page Interativa com Three.js
 * Este script implementa os efeitos 3D e interações da landing page
 */

// Variáveis globais
let scene, camera, renderer;
let particles = [];
let particleGroup;
let clock = new THREE.Clock();
let mouse = new THREE.Vector2();
let targetMouse = new THREE.Vector2();
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
let currentSection = 'hero';
let isLoaded = false;

// Cores
const colors = [
    new THREE.Color(0x8A2BE2), // Roxo primário
    new THREE.Color(0x9370DB), // Roxo secundário
    new THREE.Color(0xBA55D3)  // Lilás
];

// Elementos DOM
const loadingOverlay = document.querySelector('.loading-overlay');
const loadingBar = document.querySelector('.loading-bar');
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.main-nav a');
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const header = document.querySelector('.site-header');

/**
 * Inicialização
 */
function init() {
    // Configuração da cena Three.js
    setupThreeJS();
    
    // Criação dos elementos 3D
    createParticles();
    
    // Event listeners
    setupEventListeners();
    
    // Animação
    animate();
    
    // Simulação de carregamento
    simulateLoading();
}

/**
 * Configuração básica do Three.js
 */
function setupThreeJS() {
    // Criar cena
    scene = new THREE.Scene();
    
    // Criar câmera com perspectiva
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;
    
    // Criar renderer WebGL
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Adicionar canvas ao DOM
    document.getElementById('canvas-container').appendChild(renderer.domElement);
}

/**
 * Criar sistema de partículas 3D
 */
function createParticles() {
    // Grupo para partículas
    particleGroup = new THREE.Group();
    scene.add(particleGroup);
    
    // Geometria para partículas
    const particleGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    
    // Criar 200 partículas com posições aleatórias
    for (let i = 0; i < 200; i++) {
        // Material com cores aleatórias
        const material = new THREE.MeshBasicMaterial({
            color: colors[Math.floor(Math.random() * colors.length)],
            transparent: true,
            opacity: Math.random() * 0.5 + 0.2
        });
        
        // Mesh para partícula
        const particle = new THREE.Mesh(particleGeometry, material);
        
        // Posição aleatória
        particle.position.x = Math.random() * 100 - 50;
        particle.position.y = Math.random() * 100 - 50;
        particle.position.z = Math.random() * 50 - 25;
        
        // Tamanho aleatório
        const scale = Math.random() * 2 + 0.5;
        particle.scale.set(scale, scale, scale);
        
        // Propriedades para animação
        particle.userData = {
            originalPosition: particle.position.clone(),
            speed: Math.random() * 0.02 + 0.01,
            amplitude: Math.random() * 1 + 0.5,
            phase: Math.random() * Math.PI * 2
        };
        
        // Adicionar à lista e ao grupo
        particles.push(particle);
        particleGroup.add(particle);
    }
}

/**
 * Configurar event listeners
 */
function setupEventListeners() {
    // Resize da janela
    window.addEventListener('resize', onWindowResize);
    
    // Movimento do mouse
    document.addEventListener('mousemove', onMouseMove);
    
    // Scroll
    window.addEventListener('scroll', onScroll);
    
    // Links de navegação
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
            
            // Fechar menu móvel se estiver aberto
            if (mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });
    });
    
    // Menu móvel
    menuToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        mainNav.classList.toggle('active');
    });
}

/**
 * Manipular redimensionamento da janela
 */
function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Capturar movimento do mouse
 */
function onMouseMove(event) {
    // Normalizar coordenadas do mouse (-1 a 1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

/**
 * Detectar seção atual com base no scroll
 */
function onScroll() {
    // Verificar qual seção está visível
    const scrollPosition = window.scrollY;
    
    // Adicionar classe scrolled ao header quando rolar a página
    if (scrollPosition > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    // Detectar seção atual
    let newSection = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 200;
        const sectionHeight = section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            newSection = section.id;
            section.classList.add('active');
        } else {
            section.classList.remove('active');
        }
    });
    
    // Atualizar navegação ativa
    if (newSection !== '' && newSection !== currentSection) {
        currentSection = newSection;
        
        // Atualizar links de navegação
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
        
        // Atualizar cor e comportamento das partículas com base na seção
        updateParticlesBehavior(currentSection);
    }
}

/**
 * Alterar comportamento das partículas com base na seção
 */
function updateParticlesBehavior(sectionId) {
    switch(sectionId) {
        case 'hero':
            // Configuração para a seção inicial
            gsap.to(particleGroup.rotation, {
                x: 0,
                y: 0,
                z: 0,
                duration: 1.5,
                ease: 'power2.inOut'
            });
            break;
            
        case 'about':
            // Suave rotação para a seção sobre
            gsap.to(particleGroup.rotation, {
                x: 0.2,
                y: 0.5,
                z: 0,
                duration: 1.5,
                ease: 'power2.inOut'
            });
            break;
            
        case 'experience':
            // Rotação mais ativa para a seção de experiência
            gsap.to(particleGroup.rotation, {
                x: -0.3,
                y: -0.2,
                z: 0.1,
                duration: 1.5,
                ease: 'power2.inOut'
            });
            break;
            
        case 'app':
            // Configuração para a seção de app
            gsap.to(particleGroup.rotation, {
                x: 0.1,
                y: -0.4,
                z: -0.1,
                duration: 1.5,
                ease: 'power2.inOut'
            });
            break;
            
        case 'contact':
            // Configuração para a seção de contato
            gsap.to(particleGroup.rotation, {
                x: -0.1,
                y: 0.3,
                z: 0.2,
                duration: 1.5,
                ease: 'power2.inOut'
            });
            break;
    }
}

/**
 * Scroll suave para a seção especificada
 */
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        window.scrollTo({
            top: section.offsetTop,
            behavior: 'smooth'
        });
    }
}

/**
 * Animar partículas
 */
function animateParticles() {
    const time = clock.getElapsedTime();
    
    // Efeito de movimento suave com o mouse
    targetMouse.x = (mouse.x * 0.1);
    targetMouse.y = (mouse.y * 0.1);
    
    // Rotação lenta do grupo inteiro
    particleGroup.rotation.x += 0.001;
    particleGroup.rotation.y += 0.002;
    
    // Animação individual de cada partícula
    particles.forEach(particle => {
        const userData = particle.userData;
        
        // Movimento de flutuação baseado em seno
        particle.position.y = userData.originalPosition.y + 
                             Math.sin(time * userData.speed + userData.phase) * userData.amplitude;
        
        // Movimento sutil com base na posição do mouse
        particle.position.x += (targetMouse.x - particle.position.x) * 0.01;
        particle.position.z += (targetMouse.y - particle.position.z) * 0.01;
        
        // Rotação suave
        particle.rotation.x += 0.01;
        particle.rotation.y += 0.02;
    });
}

/**
 * Loop de animação principal
 */
function animate() {
    requestAnimationFrame(animate);
    
    if (isLoaded) {
        animateParticles();
    }
    
    renderer.render(scene, camera);
}

/**
 * Simular carregamento com barra de progresso
 */
function simulateLoading() {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            // Finalizar carregamento
            setTimeout(() => {
                loadingOverlay.classList.add('hidden');
                isLoaded = true;
                
                // Ativar a primeira seção
                sections[0].classList.add('active');
            }, 500);
        }
        
        // Atualizar barra de progresso
        loadingBar.style.width = `${progress}%`;
    }, 300);
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);