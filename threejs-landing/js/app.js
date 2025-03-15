/**
 * Amigo Secreto - Landing Page Interativa com Three.js
 * Este script implementa os efeitos 3D e interações da landing page
 * Versão aprimorada com modelo 3D, parallax e animações avançadas
 */

// Variáveis globais
let scene, camera, renderer, presentModel;
let particles = [];
let particleGroup;
let clock = new THREE.Clock();
let mouse = new THREE.Vector2();
let targetMouse = new THREE.Vector2();
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
let currentSection = 'hero';
let isLoaded = false;
let heroPresent = null;
let cameraRotationEnabled = true;

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
    
    // Adicionar iluminação
    setupLighting();
    
    // Adicionar modelo 3D do presente
    createPresentModel();
    
    // Event listeners
    setupEventListeners();
    
    // Animação
    animate();
    
    // Simulação de carregamento
    simulateLoading();
    
    // Inicializar sistemas de animação e parallax
    initializeAnimationSystems();
}

/**
 * Inicializa os sistemas de animação e parallax
 */
function initializeAnimationSystems() {
    // Inicializar o gerenciador de animações para elementos quando entram na tela
    if (typeof animationManager !== 'undefined') {
        animationManager.init();
    }
    
    // Inicializar o gerenciador de parallax
    if (typeof parallaxManager !== 'undefined') {
        parallaxManager.init();
    }
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
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Adicionar canvas ao DOM
    document.getElementById('canvas-container').appendChild(renderer.domElement);
}

/**
 * Configurar iluminação da cena
 */
function setupLighting() {
    // Luz ambiente
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    // Luz direcional principal (com sombras)
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(10, 10, 10);
    mainLight.castShadow = true;
    
    // Configurações de sombra
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -10;
    mainLight.shadow.camera.right = 10;
    mainLight.shadow.camera.top = 10;
    mainLight.shadow.camera.bottom = -10;
    
    scene.add(mainLight);
    
    // Luz de preenchimento
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);
    
    // Luz de destaque para o presente
    const spotLight = new THREE.SpotLight(0xBA55D3, 0.8);
    spotLight.position.set(0, 10, 5);
    spotLight.angle = Math.PI / 6;
    spotLight.penumbra = 0.2;
    scene.add(spotLight);
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
 * Criar modelo 3D do presente
 */
function createPresentModel() {
    // Verificar se a classe PresentModel está disponível
    if (typeof PresentModel !== 'undefined') {
        // Criar presente para a seção hero
        heroPresent = new PresentModel(scene, { x: 0, y: 0, z: -5 }, 3);
        
        // Ajustar posição com base no tamanho da tela
        if (window.innerWidth < 768) {
            heroPresent.updateScale(2);
            heroPresent.present.position.y = -2;
        }
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
    
    // Ajustar tamanho do presente com base no tamanho da tela
    if (heroPresent) {
        if (window.innerWidth < 768) {
            heroPresent.updateScale(2);
            heroPresent.present.position.y = -2;
        } else {
            heroPresent.updateScale(3);
            heroPresent.present.position.y = 0;
        }
    }
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
        
        // Atualizar visibilidade e rotação do presente 3D com base na seção
        updatePresentVisibility(currentSection);
    }
}

/**
 * Atualiza a visibilidade e comportamento do presente 3D com base na seção atual
 */
function updatePresentVisibility(sectionId) {
    if (!heroPresent) return;
    
    switch(sectionId) {
        case 'hero':
            // Mostrar o presente com uma animação suave
            gsap.to(heroPresent.present.position, {
                y: 0,
                z: -5,
                duration: 1.5,
                ease: 'power2.out'
            });
            
            gsap.to(heroPresent.present.scale, {
                x: 3,
                y: 3,
                z: 3,
                duration: 1.5,
                ease: 'power2.out'
            });
            
            // Ativar rotação da câmera
            cameraRotationEnabled = true;
            break;
            
        case 'about':
            // Posicionar o presente para a seção sobre
            gsap.to(heroPresent.present.position, {
                x: 10,
                y: 0,
                z: -10,
                duration: 1.5,
                ease: 'power2.inOut'
            });
            
            gsap.to(heroPresent.present.scale, {
                x: 2,
                y: 2,
                z: 2,
                duration: 1.5,
                ease: 'power2.inOut'
            });
            
            // Desativar rotação da câmera
            cameraRotationEnabled = false;
            break;
            
        default:
            // Esconder o presente em outras seções
            gsap.to(heroPresent.present.position, {
                y: -20,
                duration: 1.5,
                ease: 'power2.inOut'
            });
            break;
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
            
            // Partículas mais dispersas
            particles.forEach(particle => {
                gsap.to(particle.userData, {
                    amplitude: Math.random() * 1 + 0.5,
                    duration: 2,
                    ease: 'power1.inOut'
                });
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
            
            // Partículas mais concentradas
            particles.forEach(particle => {
                gsap.to(particle.userData, {
                    amplitude: Math.random() * 0.5 + 0.2,
                    duration: 2,
                    ease: 'power1.inOut'
                });
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
            
            // Partículas mais animadas
            particles.forEach(particle => {
                gsap.to(particle.userData, {
                    amplitude: Math.random() * 1.5 + 1,
                    speed: Math.random() * 0.03 + 0.02,
                    duration: 2,
                    ease: 'power1.inOut'
                });
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
            
            // Partículas estáveis
            particles.forEach(particle => {
                gsap.to(particle.userData, {
                    amplitude: Math.random() * 0.3 + 0.1,
                    speed: Math.random() * 0.01 + 0.01,
                    duration: 2,
                    ease: 'power1.inOut'
                });
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
            
            // Partículas suaves
            particles.forEach(particle => {
                gsap.to(particle.userData, {
                    amplitude: Math.random() * 0.2 + 0.1,
                    speed: Math.random() * 0.01 + 0.005,
                    duration: 2,
                    ease: 'power1.inOut'
                });
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
    if (cameraRotationEnabled) {
        particleGroup.rotation.x += 0.001;
        particleGroup.rotation.y += 0.002;
    }
    
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
    
    const time = clock.getElapsedTime();
    
    if (isLoaded) {
        // Animar partículas
        animateParticles();
        
        // Animar presente 3D se existir
        if (heroPresent) {
            heroPresent.animate(time);
        }
        
        // Ajustar rotação da câmera com base no mouse
        if (cameraRotationEnabled) {
            camera.position.x += (targetMouse.x * 5 - camera.position.x) * 0.05;
            camera.position.y += (-targetMouse.y * 5 - camera.position.y) * 0.05;
            camera.lookAt(scene.position);
        }
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
                
                // Iniciar animações específicas para elementos na primeira seção
                triggerHeroAnimations();
            }, 500);
        }
        
        // Atualizar barra de progresso
        loadingBar.style.width = `${progress}%`;
    }, 300);
}

/**
 * Ativar animações específicas para a seção hero
 */
function triggerHeroAnimations() {
    // Esta função pode ser usada para ativar animações específicas
    // que não sejam controladas pelo gerenciador de animações
    // Por exemplo, animações que precisam ser sincronizadas com outros eventos
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);