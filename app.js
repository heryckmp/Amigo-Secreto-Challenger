// Elementos DOM
const participantForm = document.getElementById('participant-form');
const participantInput = document.getElementById('participant-input');
const participantsList = document.getElementById('participants-list');
const participantsCount = document.getElementById('participants-count');
const drawButton = document.getElementById('draw-button');
const resultList = document.getElementById('result-list');
const resultSection = document.getElementById('result-section');
const friendName = document.getElementById('friend-name');
const closeResultButton = document.getElementById('close-result');
const confettiCanvas = document.getElementById('confetti-canvas');
const canvasContainer = document.getElementById('canvas-container');

// Arrays para armazenar participantes e resultados
let participants = [];
let results = [];

// Configuração do canvas para confete
const ctx = confettiCanvas.getContext('2d');
let confettiActive = false;
let confettiPieces = [];
const colors = ['#8A2BE2', '#9370DB', '#BA55D3', '#FF69B4', '#FFD700', '#00BFFF', '#32CD32'];

// Variáveis para Three.js
let scene, camera, renderer;
let presentModel;
let snowSystem;
let clock;
let mouse = { x: 0, y: 0 };

// Tamanho original do presente (aumentado para 1.5)
const originalPresentSize = 1.5;

// Inicialização
function init() {
    // Verificar se existem participantes salvos no localStorage
    const savedParticipants = localStorage.getItem('amigoSecreto_participants');
    if (savedParticipants) {
        participants = JSON.parse(savedParticipants);
        updateParticipantsList();
    }

    // Configurar tamanho do canvas para confetes
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;

    // Event listeners
    participantForm.addEventListener('submit', addParticipant);
    drawButton.addEventListener('click', drawSecretFriends);
    closeResultButton.addEventListener('click', closeResultModal);
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('mousemove', onMouseMove);

    // Inicializar Three.js e o modelo 3D se o container existir
    if (canvasContainer) {
        initThreeJS();
        createStars();
    }
    
    // Aplicar efeitos de animação aos elementos com atributo data-animation
    initElementAnimations();
}

// Criar estrelas no background
function createStars() {
    const starsContainer = document.querySelector('.background');
    const numberOfStars = 80;
    
    for (let i = 0; i < numberOfStars; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        
        // Posições aleatórias
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        
        // Tamanhos variados
        const size = Math.random() * 3 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // Atraso na animação para que não pisquem todas juntas
        star.style.animationDelay = `${Math.random() * 5}s`;
        
        starsContainer.appendChild(star);
    }
}

// Inicializar animações para elementos
function initElementAnimations() {
    // Obter todos os elementos com o atributo data-animation
    const animatedElements = document.querySelectorAll('[data-animation]');
    
    animatedElements.forEach(element => {
        // Aplicar classes de animação com base no tipo
        const animationType = element.getAttribute('data-animation');
        const delay = element.getAttribute('data-delay') || 0;
        
        // Inicialmente, esconder o elemento
        element.style.opacity = '0';
        
        // Observar quando o elemento entra na viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Atrasar a animação conforme especificado
                    setTimeout(() => {
                        // Remover observador após animar
                        observer.unobserve(element);
                        
                        // Aplicar animação com base no tipo
                        element.style.opacity = '1';
                        
                        switch (animationType) {
                            case 'fadeIn':
                                element.style.animation = `fadeIn 1s forwards`;
                                break;
                            case 'fadeUp':
                                element.style.animation = `fadeUp 0.8s forwards`;
                                break;
                            case 'scale':
                                element.style.animation = `scale 1s forwards`;
                                break;
                            default:
                                element.style.animation = `fadeIn 1s forwards`;
                        }
                    }, delay * 1000);
                }
            });
        }, { threshold: 0.1 });
        
        // Começar a observar o elemento
        observer.observe(element);
    });
}

// Inicializar Three.js
function initThreeJS() {
    // Criar relógio para animações
    clock = new THREE.Clock();
    
    // Configurar cena
    scene = new THREE.Scene();
    
    // Configurar câmera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    // Configurar renderizador
    renderer = new THREE.WebGLRenderer({ 
        alpha: true,
        antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasContainer.appendChild(renderer.domElement);
    
    // Adicionar luzes
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);
    
    // Inicializar sistema de neve (aumentando quantidade para 12000)
    // A neve deve ser iniciada primeiro para ficar atrás de outros elementos 3D
    snowSystem = new SnowSystem(scene, 12000);
    
    // Criar modelo 3D de presente
    presentModel = new PresentModel(scene, { x: 0, y: 0, z: 1 }, originalPresentSize);
    
    // Iniciar loop de animação
    animate();
}

// Movimento do mouse
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// Atualizar tamanho do canvas ao redimensionar janela
function onWindowResize() {
    // Atualizar canvas confetti
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    
    // Atualizar Three.js se existir
    if (renderer && camera) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Loop de animação para Three.js
function animate() {
    requestAnimationFrame(animate);
    
    const time = clock ? clock.getElapsedTime() : 0;
    
    // Animar modelo de presente
    if (presentModel) {
        presentModel.animate(time);
        
        // Adicionar movimento suave em resposta ao mouse
        presentModel.present.rotation.y += mouse.x * 0.01;
        presentModel.present.rotation.x += mouse.y * 0.01;
    }
    
    // Atualizar sistema de neve
    if (snowSystem) {
        snowSystem.update(time);
    }
    
    // Renderizar cena
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// Adicionar participante
function addParticipant(e) {
    e.preventDefault();
    const name = participantInput.value.trim();
    
    if (name === '') {
        showMessage('Por favor, digite um nome válido.', 'error');
        return;
    }
    
    if (participants.includes(name)) {
        showMessage('Este nome já foi adicionado.', 'error');
        return;
    }
    
    participants.push(name);
    saveParticipants();
    updateParticipantsList();
    
    participantInput.value = '';
    participantInput.focus();
    
    showMessage(`${name} foi adicionado com sucesso!`, 'success');
    
    // Animar o presente 3D para "celebrar" a adição
    if (presentModel) {
        // Adicionar uma pequena animação de "pulo"
        gsap.to(presentModel.present.position, {
            y: 0.5,
            duration: 0.3,
            ease: 'power2.out',
            onComplete: () => {
                gsap.to(presentModel.present.position, {
                    y: 0,
                    duration: 0.5,
                    ease: 'bounce.out'
                });
            }
        });
    }
}

// Salvar participantes no localStorage
function saveParticipants() {
    localStorage.setItem('amigoSecreto_participants', JSON.stringify(participants));
}

// Atualizar lista de participantes na interface
function updateParticipantsList() {
    participantsList.innerHTML = '';
    participantsCount.textContent = participants.length;
    
    participants.forEach((participant, index) => {
        const li = document.createElement('li');
        
        // Aplicar atributo de animação para entrada gradual
        li.setAttribute('data-animation', 'fadeUp');
        li.setAttribute('data-delay', (index * 0.1).toString());
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = participant;
        nameSpan.classList.add('name-item');
        
        const deleteButton = document.createElement('img');
        deleteButton.src = 'https://cdn-icons-png.flaticon.com/512/5058/5058192.png';
        deleteButton.alt = 'Remover';
        deleteButton.classList.add('trash-icon');
        deleteButton.onclick = () => removeParticipant(index);
        
        li.appendChild(nameSpan);
        li.appendChild(deleteButton);
        participantsList.appendChild(li);
    });
    
    // Inicializar animações para os novos itens
    initElementAnimations();
    
    // Habilitar ou desabilitar botão de sorteio
    if (participants.length >= 3) {
        drawButton.removeAttribute('disabled');
    } else {
        drawButton.setAttribute('disabled', 'true');
    }
}

// Remover participante
function removeParticipant(index) {
    const removedName = participants[index];
    participants.splice(index, 1);
    saveParticipants();
    updateParticipantsList();
    showMessage(`${removedName} foi removido da lista.`, 'error');
}

// Exibir mensagens temporárias
function showMessage(message, type) {
    resultList.textContent = message;
    resultList.className = 'result-list glass';
    resultList.classList.add(type);
    
    setTimeout(() => {
        resultList.textContent = '';
        resultList.className = 'result-list glass';
    }, 3000);
}

// Embaralhar array (algoritmo Fisher-Yates)
function shuffle(array) {
    let currentIndex = array.length;
    let temporaryValue, randomIndex;
    
    // Enquanto existirem elementos a embaralhar
    while (currentIndex !== 0) {
        // Selecionar um elemento restante
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        
        // Trocar com o elemento atual
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    
    return array;
}

// Realizar sorteio
function drawSecretFriends() {
    if (participants.length < 3) {
        showMessage('São necessários pelo menos 3 participantes para o sorteio.', 'error');
        return;
    }
    
    // Copiar array de participantes e embaralhar
    const shuffled = [...participants];
    shuffle(shuffled);
    
    // Gerar pares para o amigo secreto
    results = [];
    for (let i = 0; i < shuffled.length; i++) {
        const giver = participants[i];
        // O último participante tira o primeiro, fechando o ciclo
        const receiver = (i === shuffled.length - 1) ? shuffled[0] : shuffled[i + 1];
        results.push({ giver, receiver });
    }
    
    // Verificar se ninguém tirou a si mesmo
    const invalidDraw = results.some(pair => pair.giver === pair.receiver);
    if (invalidDraw) {
        drawSecretFriends(); // Refazer o sorteio
        return;
    }
    
    showMessage('Sorteio realizado com sucesso! Clique nos nomes para ver quem tirou quem.', 'success');
    showResults();
    
    // Animar o modelo 3D para "celebrar" o sorteio
    if (presentModel) {
        // Animação especial para o sorteio - aumentar e depois voltar ao tamanho original
        const celebrationScale = originalPresentSize * 3;  // Tamanho temporário para celebração
        
        // Sequência de animação usando GSAP Timeline
        const tl = gsap.timeline();
        
        // Primeiro aumenta
        tl.to(presentModel.present.scale, {
            x: celebrationScale, 
            y: celebrationScale, 
            z: celebrationScale,
            duration: 0.5,
            ease: 'power2.out'
        })
        // Depois volta ao tamanho original com efeito elástico
        .to(presentModel.present.scale, {
            x: originalPresentSize, 
            y: originalPresentSize, 
            z: originalPresentSize,
            duration: 0.8,
            ease: 'elastic.out(1, 0.3)'
        });
        
        // Aumentar a velocidade de rotação temporariamente
        gsap.to(presentModel.present.rotation, {
            y: presentModel.present.rotation.y + Math.PI * 4,
            duration: 2,
            ease: 'power1.inOut'
        });
    }
}

// Mostrar resultados do sorteio
function showResults() {
    // Para um demo, vamos mostrar um resultado aleatório
    const randomIndex = Math.floor(Math.random() * results.length);
    const randomResult = results[randomIndex];
    
    // Mostrar o nome do amigo sorteado na modal
    friendName.textContent = randomResult.receiver;
    
    // Mostrar o modal com efeito de fade
    resultSection.classList.add('show');
    
    // Iniciar animação de confete
    startConfetti();
    
    // Aplicar animação ao nome
    friendName.style.animation = 'none';
    void friendName.offsetWidth; // Reiniciar animação
    friendName.style.animation = 'fadeInUp 0.8s forwards';
}

// Fechar modal de resultados
function closeResultModal() {
    resultSection.classList.remove('show');
    stopConfetti();
}

// Iniciar animação de confete
function startConfetti() {
    confettiActive = true;
    confettiPieces = [];
    
    // Criar peças de confete
    for (let i = 0; i < 150; i++) {
        confettiPieces.push({
            x: Math.random() * confettiCanvas.width,
            y: Math.random() * -confettiCanvas.height,
            size: Math.random() * 10 + 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            speed: Math.random() * 3 + 2,
            rotationSpeed: Math.random() * 5 - 2.5,
            oscillationSpeed: Math.random() * 2 + 1,
            oscillationDistance: Math.random() * 5 + 5,
            shape: Math.random() < 0.5 ? 'circle' : 'square',
            initialX: 0
        });
        
        confettiPieces[i].initialX = confettiPieces[i].x;
    }
    
    animateConfetti();
}

// Parar animação de confete
function stopConfetti() {
    confettiActive = false;
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
}

// Animar confete
function animateConfetti() {
    if (!confettiActive) return;
    
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    
    confettiPieces.forEach(piece => {
        ctx.save();
        
        // Movimento e oscilação
        piece.y += piece.speed;
        piece.x = piece.initialX + Math.sin(piece.y * 0.01) * piece.oscillationDistance;
        piece.rotation += piece.rotationSpeed;
        
        // Desenhar peça de confete com efeito 3D (rotação)
        ctx.translate(piece.x, piece.y);
        ctx.rotate(piece.rotation * Math.PI / 180);
        
        // Aplicar efeito de sombra para profundidade 3D
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Desenhar formas diferentes
        ctx.fillStyle = piece.color;
        if (piece.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, piece.size / 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Quadrado com perspectiva
            ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size);
            
            // Adicionar brilho para efeito 3D
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.moveTo(-piece.size / 2, -piece.size / 2);
            ctx.lineTo(piece.size / 2, -piece.size / 2);
            ctx.lineTo(0, 0);
            ctx.closePath();
            ctx.fill();
        }
        
        ctx.restore();
        
        // Reiniciar peças que saem da tela
        if (piece.y > confettiCanvas.height) {
            piece.y = Math.random() * -100;
            piece.initialX = Math.random() * confettiCanvas.width;
            piece.x = piece.initialX;
        }
    });
    
    requestAnimationFrame(animateConfetti);
}

// Definir animações CSS
function setupAnimations() {
    // Adicionar estilos de animação ao head se ainda não existem
    if (!document.getElementById('animation-styles')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'animation-styles';
        
        styleEl.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes fadeUp {
                from { 
                    opacity: 0;
                    transform: translateY(20px);
                }
                to { 
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes scale {
                from { 
                    opacity: 0;
                    transform: scale(0.8);
                }
                to { 
                    opacity: 1;
                    transform: scale(1);
                }
            }
        `;
        
        document.head.appendChild(styleEl);
    }
}

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', () => {
    setupAnimations();
    init();
});