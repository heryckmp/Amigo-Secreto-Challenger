// DOM Elements
const inputName = document.getElementById('input-name');
const addButton = document.getElementById('add-button');
const participantsList = document.getElementById('participants-list');
const participantsCount = document.getElementById('participants-count');
const drawButton = document.getElementById('draw-button');
const resultList = document.getElementById('result-list');
const resultSection = document.getElementById('result-section');
const friendName = document.getElementById('friend-name');
const closeResultButton = document.getElementById('close-result');
const avatarCircle = document.querySelector('.avatar-circle');
const confettiCanvas = document.getElementById('confetti-canvas');
const snowContainer = document.getElementById('snow-container');
const presentContainer = document.getElementById('present-container');

// Novos elementos para compartilhamento
const copyLinkButton = document.getElementById('copy-link-button');
const showQrButton = document.getElementById('show-qr-button');
const qrContainer = document.getElementById('qr-container');
const qrcodeEl = document.getElementById('qrcode');

// Icons in base64
const cameraIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNhbWVyYSI+PHBhdGggZD0iTTEgOGEyIDIgMCAwIDEgMi0yaC4wOWEyIDIgMCAwIDAgMS40Mi0uNTlsMi41OS0yLjZhMiAyIDAgMCAxIDEuNDItLjU4aDRhMiAyIDAgMCAxIDEuNDIuNThsMi41OSAyLjZhMiAyIDAgMCAwIDEuNDIuNTlIMS44QTIgMiAwIDAgMSAxIDh6Ii8+PHBhdGggZD0iTTIgOHYxMGEyIDIgMCAwIDAgMiAyaDE2YTIgMiAwIDAgMCAyLTJWOCIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTMiIHI9IjMiLz48L3N2Zz4=';
const trashIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0zIDZoMThNMTkgNnYxNGEyIDIgMCAwMS0yIDJIN2EyIDIgMCAwMS0yLTJWNm0zIDBWNGEyIDIgMCAwMTItMmg0YTIgMiAwIDAxMiAydjIiLz48cGF0aCBkPSJNMTAgMTF2NiIvPjxwYXRoIGQ9Ik0xNCAxMXY2Ii8+PC9zdmc+';

// Global Variables
let participants = [];
let results = {};
let selectedParticipant = null;
let fireworksActive = false;
let fireworksAnimationId = null;
let currentResult = null;

// Configuração do canvas para confete
const ctx = confettiCanvas.getContext('2d');
let confettiActive = false;
let confettiPieces = [];
const colors = ['#8A2BE2', '#9370DB', '#BA55D3', '#FF69B4', '#FFD700', '#00BFFF', '#32CD32'];

// Variáveis para Three.js
let scene, camera, renderer;
let presentModel;
let snowSystem;
let snowScene, snowCamera, snowRenderer;
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
    
    // Inicializar o canvas de fogos de artifício
    initFireworks();

    // Event listeners
    addButton.addEventListener('click', addParticipant);
    inputName.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addParticipant(e);
        }
    });
    drawButton.addEventListener('click', drawSecretFriends);
    closeResultButton.addEventListener('click', closeResultModal);
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('mousemove', onMouseMove);
    
    // Novos event listeners para compartilhamento
    copyLinkButton.addEventListener('click', copyShareLink);
    showQrButton.addEventListener('click', toggleQrCode);
    
    // Verificar se há um resultado compartilhado na URL
    checkSharedResult();

    // Inicializar Three.js para a neve como background
    initSnowSystem();
    
    // Inicializar Three.js para o presente 3D
    initPresentModel();
    
    // Criar estrelas decorativas
    createStars();
    
    // Aplicar efeitos de animação aos elementos
    initElementAnimations();
}

// Verificar se há um resultado compartilhado na URL
function checkSharedResult() {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('share');
    
    if (sharedData) {
        try {
            const decodedData = JSON.parse(atob(sharedData));
            
            // Se temos dados válidos, exibir o resultado compartilhado
            if (decodedData && decodedData.giver && decodedData.receiver) {
                // Configurar participantes se necessário
                if (!participants.includes(decodedData.giver)) {
                    participants.push(decodedData.giver);
                }
                if (!participants.includes(decodedData.receiver)) {
                    participants.push(decodedData.receiver);
                }
                updateParticipantsList();
                
                // Exibir resultado compartilhado
                showSharedResult(decodedData);
            }
        } catch (e) {
            console.error('Erro ao processar dados compartilhados:', e);
        }
    }
}

// Exibir resultado compartilhado
function showSharedResult(resultData) {
    // Salvar o resultado atual para compartilhamento
    currentResult = resultData;
    
    // Exibir o nome do amigo no modal
    friendName.textContent = resultData.receiver;
    
    // Mostrar o modal com efeito de fade
    resultSection.classList.add('show');
    
    // Iniciar animação de fogos de artifício
    startFireworks();
    
    // Aplicar animação ao nome
    friendName.style.animation = 'none';
    void friendName.offsetWidth; // Reiniciar animação
    friendName.style.animation = 'fadeInUp 0.8s forwards';
}

// Gerar link compartilhável
function generateShareLink(resultData) {
    // Converter o resultado para Base64
    const resultBase64 = btoa(JSON.stringify(resultData));
    
    // Criar URL completa com parâmetro de compartilhamento
    const shareUrl = `${window.location.origin}${window.location.pathname}?share=${resultBase64}`;
    
    return shareUrl;
}

// Copiar link para clipboard
function copyShareLink() {
    if (!currentResult) return;
    
    const shareUrl = generateShareLink(currentResult);
    
    // Usar a API moderna de clipboard
    navigator.clipboard.writeText(shareUrl)
        .then(() => {
            showToast('Link copiado para a área de transferência!');
        })
        .catch(err => {
            console.error('Erro ao copiar link:', err);
            
            // Fallback para método alternativo
            const tempInput = document.createElement('input');
            tempInput.value = shareUrl;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            
            showToast('Link copiado para a área de transferência!');
        });
}

// Mostrar/esconder código QR
function toggleQrCode() {
    if (!currentResult) return;
    
    if (qrContainer.classList.contains('hidden')) {
        // Limpar conteúdo anterior
        qrcodeEl.innerHTML = '';
        
        // Gerar URL compartilhável
        const shareUrl = generateShareLink(currentResult);
        
        // Gerar QR code
        QRCode.toCanvas(qrcodeEl, shareUrl, {
            width: 180,
            margin: 1,
            color: {
                dark: '#8A2BE2',  // Cor do QR code
                light: '#FFFFFF'  // Cor de fundo
            }
        }, function(error) {
            if (error) console.error(error);
        });
        
        // Mostrar container
        qrContainer.classList.remove('hidden');
        qrContainer.classList.add('show');
    } else {
        // Esconder container
        qrContainer.classList.remove('show');
        qrContainer.classList.add('hidden');
    }
}

// Exibir notificação toast
function showToast(message) {
    // Remover toast existente se houver
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        document.body.removeChild(existingToast);
    }
    
    // Criar novo toast
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    
    // Adicionar ao DOM
    document.body.appendChild(toast);
    
    // Forçar reflow para animação funcionar
    void toast.offsetWidth;
    
    // Mostrar toast
    toast.classList.add('show');
    
    // Remover toast após animação
    setTimeout(() => {
        if (document.body.contains(toast)) {
            document.body.removeChild(toast);
        }
    }, 3000);
}

// Mostrar resultados do sorteio
function showResults() {
    // Para um demo, vamos mostrar um resultado aleatório
    if (!currentResult && results.length > 0) {
        const randomIndex = Math.floor(Math.random() * results.length);
        currentResult = results[randomIndex];
    }
    
    if (!currentResult) return;
    
    // Mostrar o nome do amigo sorteado na modal
    friendName.textContent = currentResult.receiver;
    
    // Mostrar o modal com efeito de fade
    resultSection.classList.add('show');
    
    // Iniciar animação de fogos de artifício
    startFireworks();
    
    // Aplicar animação ao nome
    friendName.style.animation = 'none';
    void friendName.offsetWidth; // Reiniciar animação
    friendName.style.animation = 'fadeInUp 0.8s forwards';
}

// Fechar modal de resultados
function closeResultModal() {
    resultSection.classList.remove('show');
    stopFireworks();
    
    // Esconder o QR code se estiver visível
    qrContainer.classList.add('hidden');
    qrContainer.classList.remove('show');
}

// Adicionar participante
function addParticipant() {
    const name = inputName.value.trim();
    
    if (name) {
        // Gerar ID único
        const id = 'participant_' + Date.now();
        
        // Adicionar à lista
        participants.push({
            id: id,
            name: name
        });
        
        // Salvar no localStorage
        localStorage.setItem('amigoSecreto_participants', JSON.stringify(participants));
        
        // Atualizar UI
        updateParticipantsList();
        
        // Limpar campo
        inputName.value = '';
        inputName.focus();
        
        // Habilitar botão de sorteio se tiver pelo menos 2 participantes
        if (participants.length >= 2) {
            drawButton.disabled = false;
        }
    }
}

// Atualizar lista de participantes
function updateParticipantsList() {
    // Limpar lista
    participantsList.innerHTML = '';
    
    // Atualizar contador
    participantsCount.textContent = participants.length;
    
    // Desabilitar botão de sorteio se não tiver pelo menos 2 participantes
    drawButton.disabled = participants.length < 2;
    
    // Adicionar cada participante à lista
    participants.forEach(participant => {
        const li = document.createElement('li');
        
        // Div para informações do participante
        const participantInfo = document.createElement('div');
        participantInfo.className = 'participant-info';
        
        // Thumbnail (reservado para expansão futura com fotos)
        const thumbnail = document.createElement('div');
        thumbnail.className = 'participant-thumbnail';
        
        // Adicionar iniciais como fallback
        const initials = document.createElement('span');
        initials.textContent = participant.name.charAt(0).toUpperCase();
        initials.style.color = 'white';
        initials.style.fontWeight = 'bold';
        initials.style.fontSize = '1.2rem';
        initials.style.display = 'flex';
        initials.style.alignItems = 'center';
        initials.style.justifyContent = 'center';
        initials.style.width = '100%';
        initials.style.height = '100%';
        
        thumbnail.appendChild(initials);
        participantInfo.appendChild(thumbnail);
        
        // Nome do participante
        const nameSpan = document.createElement('span');
        nameSpan.className = 'name-item';
        nameSpan.textContent = participant.name;
        participantInfo.appendChild(nameSpan);
        
        // Adicionar div de informação do participante ao li
        li.appendChild(participantInfo);
        
        // Botão de excluir com ícone de lixeira
        const deleteButton = document.createElement('div');
        deleteButton.className = 'delete-button';
        deleteButton.innerHTML = `
            <img src="${trashIcon}" alt="Excluir" class="trash-icon" data-id="${participant.id}">
            <span class="delete-tooltip">Excluir</span>
        `;
        deleteButton.addEventListener('click', () => removeParticipant(participant.id));
        
        // Adicionar botão de excluir ao li
        li.appendChild(deleteButton);
        
        // Adicionar item à lista
        participantsList.appendChild(li);
    });
}

// Remover participante
function removeParticipant(id) {
    // Filtrar o participante a ser removido
    participants = participants.filter(p => p.id !== id);
    
    // Atualizar localStorage
    localStorage.setItem('amigoSecreto_participants', JSON.stringify(participants));
    
    // Atualizar UI
    updateParticipantsList();
}

// Desenhar amigos secretos
function drawSecretFriends() {
    if (participants.length < 2) {
        return;
    }
    
    // Criar uma cópia para embaralhar
    const shuffled = [...participants];
    
    // Embaralhar array
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Limpar resultados anteriores
    results = [];
    
    // Atribuir amigos secretos (cada pessoa dá presente para a próxima na lista embaralhada)
    for (let i = 0; i < shuffled.length; i++) {
        const giver = shuffled[i];
        const receiver = shuffled[(i + 1) % shuffled.length];
        
        results.push({
            giver: giver.name,
            receiver: receiver.name,
            giverId: giver.id,
            receiverId: receiver.id
        });
    }
    
    // Mostrar resultados
    showResults();
    
    // Exibir mensagem na seção de resultados
    resultList.innerHTML = '';
    resultList.classList.remove('hidden');
    
    const successMessage = document.createElement('div');
    successMessage.textContent = 'Sorteio realizado com sucesso! Clique nos nomes para ver o resultado.';
    successMessage.className = 'success';
    resultList.appendChild(successMessage);
    
    // Tornar nomes clicáveis para revelar
    makeNamesClickable();
}

// Tornar nomes clicáveis
function makeNamesClickable() {
    // Adicionar efeitos visuais e interação para cada participante na lista
    const nameItems = document.querySelectorAll('.name-item');
    
    nameItems.forEach((nameItem, index) => {
        // Estilos para indicar clicabilidade
        nameItem.style.cursor = 'pointer';
        nameItem.style.transition = 'all 0.2s ease';
        
        // Adicionar evento de clique
        nameItem.addEventListener('click', () => {
            // Encontrar resultado correspondente ao clicado
            const participantName = nameItem.textContent;
            const result = results.find(r => r.giver === participantName);
            
            if (result) {
                currentResult = result;
                showResults();
            }
        });
        
        // Efeitos de hover
        nameItem.addEventListener('mouseover', () => {
            nameItem.style.color = '#BA55D3';
            nameItem.style.transform = 'translateX(5px)';
        });
        
        nameItem.addEventListener('mouseout', () => {
            nameItem.style.color = '';
            nameItem.style.transform = '';
        });
    });
}

// Iniciar fogos de artifício
function startFireworks() {
    // Tornar o canvas visível
    const fireworksCanvas = document.querySelector('.fireworks-canvas');
    if (fireworksCanvas) {
        fireworksCanvas.style.display = 'block';
    }
    
    // Ativar os fogos
    fireworksActive = true;
    
    // Começar animação
    if (!fireworksAnimationId) {
        animate();
    }
}

// Parar fogos de artifício
function stopFireworks() {
    fireworksActive = false;
    
    if (fireworksAnimationId) {
        cancelAnimationFrame(fireworksAnimationId);
        fireworksAnimationId = null;
    }
    
    // Esconder o canvas
    const canvas = document.querySelector('.fireworks-canvas');
    if (canvas) {
        canvas.style.display = 'none';
        // Limpar o canvas
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// Inicializar fogos de artifício
function initFireworks() {
    const canvas = document.querySelector('.fireworks-canvas');
    if (!canvas) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext('2d');
    
    // Inicializar arrays
    fireworks = [];
    particles = [];
}

// Função para animar fogos de artifício
function animate() {
    // Verificar se a animação deve continuar
    if (!fireworksActive) return;
    
    // Continuar a animação
    fireworksAnimationId = requestAnimationFrame(animate);
    
    const canvas = document.querySelector('.fireworks-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Limpar o canvas com um efeito de fade
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Adicionar novos fogos de artifício aleatoriamente
    if (Math.random() < 0.05) {
        createFirework();
    }
    
    // Atualizar e desenhar fogos existentes
    updateFireworks();
}

// Criar um novo fogo de artifício
function createFirework() {
    const canvas = document.querySelector('.fireworks-canvas');
    if (!canvas) return;
    
    const x = Math.random() * canvas.width;
    const y = canvas.height;
    const targetY = Math.random() * canvas.height * 0.6;
    
    fireworks.push({
        x,
        y,
        targetY,
        color: getRandomFireworkColor(),
        vel: {
            x: Math.random() * 3 - 1.5,
            y: -3 - Math.random() * 3
        },
        exploded: false,
        particles: []
    });
}

// Atualizar posição dos fogos de artifício
function updateFireworks() {
    const canvas = document.querySelector('.fireworks-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    for (let i = fireworks.length - 1; i >= 0; i--) {
        const fw = fireworks[i];
        
        // Atualizar posição
        fw.x += fw.vel.x;
        fw.y += fw.vel.y;
        
        // Desenhar o fogo
        ctx.beginPath();
        ctx.arc(fw.x, fw.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = fw.color;
        ctx.fill();
        
        // Verificar se deve explodir
        if (fw.y <= fw.targetY) {
            explodeFirework(fw);
            fireworks.splice(i, 1);
        }
        
        // Atualizar e desenhar partículas
        if (fw.exploded) {
            for (let j = fw.particles.length - 1; j >= 0; j--) {
                const p = fw.particles[j];
                
                p.x += p.vel.x;
                p.y += p.vel.y;
                p.vel.y += 0.05; // Gravidade
                p.alpha -= 0.01;
                
                ctx.globalAlpha = p.alpha;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                ctx.fillStyle = fw.color;
                ctx.fill();
                
                if (p.alpha <= 0) {
                    fw.particles.splice(j, 1);
                }
            }
            
            if (fw.particles.length === 0) {
                fireworks.splice(i, 1);
            }
        }
    }
    
    ctx.globalAlpha = 1;
}

// Explodir um fogo de artifício
function explodeFirework(fw) {
    fw.exploded = true;
    
    for (let i = 0; i < 100; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        
        fw.particles.push({
            x: fw.x,
            y: fw.y,
            vel: {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            },
            alpha: 1
        });
    }
}

// Gerar uma cor aleatória para os fogos de artifício
function getRandomFireworkColor() {
    const colors = [
        '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
        '#FF00FF', '#00FFFF', '#FFA500', '#FF1493',
        '#FFD700', '#7CFC00', '#BA55D3', '#FF6347'
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
}

// Função compatível para iniciar confete (se necessário)
function startConfetti() {
    startFireworks();
}

// Função compatível para parar confete (se necessário)
function stopConfetti() {
    stopFireworks();
}

// Função para redimensionar a janela
function onWindowResize() {
    // Atualizar tamanho dos canvas
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    
    const fireworksCanvas = document.querySelector('.fireworks-canvas');
    if (fireworksCanvas) {
        fireworksCanvas.width = window.innerWidth;
        fireworksCanvas.height = window.innerHeight;
    }
    
    // Atualizar demais elementos responsivos (como Three.js)
}

// Função para rastrear movimento do mouse
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// Funções para setup de animações - Vazias para evitar erros
function initSnowSystem() {}
function initPresentModel() {}
function createStars() {}
function initElementAnimations() {}
function setupAnimations() {}

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', () => {
    setupAnimations();
    init();
});