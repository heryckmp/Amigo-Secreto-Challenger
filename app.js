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
let results = [];
let currentResult = null;
let fireworksActive = false;
let fireworksAnimationId = null;

// Canvas e contexto para confetes
const ctxConfetti = confettiCanvas.getContext('2d');
let confettiActive = false;
let confettiPieces = [];

// Canvas e contexto para fogos de artifício
let fireworksCanvas;
let ctxFireworks;
let fireworks = [];
let particles = [];

// Cores
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
        try {
            participants = JSON.parse(savedParticipants);
            updateParticipantsList();
        } catch (e) {
            console.error('Erro ao carregar participantes:', e);
        }
    }

    // Configurar tamanho do canvas para confetes
    if (confettiCanvas) {
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
    }
    
    // Inicializar o canvas de fogos de artifício
    initFireworks();

    // Event listeners
    if (addButton) addButton.addEventListener('click', addParticipant);
    if (inputName) inputName.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addParticipant();
        }
    });
    if (drawButton) drawButton.addEventListener('click', drawSecretFriends);
    if (closeResultButton) closeResultButton.addEventListener('click', closeResultModal);
    
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('mousemove', onMouseMove);
    
    // Novos event listeners para compartilhamento
    if (copyLinkButton) copyLinkButton.addEventListener('click', copyShareLink);
    if (showQrButton) showQrButton.addEventListener('click', toggleQrCode);
    
    // Verificar se há um resultado compartilhado na URL
    checkSharedResult();

    // Inicializar Three.js para a neve como background
    try {
        if (typeof initSnowSystem === 'function') {
            initSnowSystem();
        }
    } catch (e) {
        console.error('Erro ao inicializar sistema de neve:', e);
    }
    
    // Inicializar Three.js para o presente 3D
    try {
        if (typeof initPresentModel === 'function') {
            initPresentModel();
        }
    } catch (e) {
        console.error('Erro ao inicializar modelo de presente:', e);
    }
    
    // Criar estrelas decorativas
    try {
        if (typeof createStars === 'function') {
            createStars();
        }
    } catch (e) {
        console.error('Erro ao criar estrelas:', e);
    }
    
    // Aplicar efeitos de animação aos elementos
    try {
        if (typeof initElementAnimations === 'function') {
            initElementAnimations();
        }
    } catch (e) {
        console.error('Erro ao inicializar animações de elementos:', e);
    }
}

// Verificar se há um resultado compartilhado na URL
function checkSharedResult() {
    try {
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
    } catch (e) {
        console.error('Erro ao verificar resultado compartilhado:', e);
    }
}

// Exibir resultado compartilhado
function showSharedResult(resultData) {
    // Salvar o resultado atual para compartilhamento
    currentResult = resultData;
    
    // Exibir o nome do amigo no modal
    if (friendName) friendName.textContent = resultData.receiver;
    
    // Mostrar o modal com efeito de fade
    if (resultSection) resultSection.classList.add('show');
    
    // Iniciar animação de fogos de artifício
    startFireworks();
    
    // Aplicar animação ao nome
    if (friendName) {
        friendName.style.animation = 'none';
        void friendName.offsetWidth; // Reiniciar animação
        friendName.style.animation = 'fadeInUp 0.8s forwards';
    }
}

// Gerar link compartilhável
function generateShareLink(resultData) {
    try {
        // Converter o resultado para Base64
        const resultBase64 = btoa(JSON.stringify(resultData));
        
        // Criar URL completa com parâmetro de compartilhamento
        const shareUrl = `${window.location.origin}${window.location.pathname}?share=${resultBase64}`;
        
        return shareUrl;
    } catch (e) {
        console.error('Erro ao gerar link compartilhável:', e);
        return window.location.href;
    }
}

// Copiar link para clipboard
function copyShareLink() {
    if (!currentResult) return;
    
    const shareUrl = generateShareLink(currentResult);
    
    try {
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
    } catch (e) {
        console.error('Erro ao copiar link:', e);
    }
}

// Mostrar/esconder código QR
function toggleQrCode() {
    if (!currentResult || !qrContainer || !qrcodeEl) return;
    
    try {
        if (qrContainer.classList.contains('hidden')) {
            // Limpar conteúdo anterior
            qrcodeEl.innerHTML = '';
            
            // Gerar URL compartilhável
            const shareUrl = generateShareLink(currentResult);
            
            // Gerar QR code
            if (typeof QRCode !== 'undefined') {
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
            }
            
            // Mostrar container
            qrContainer.classList.remove('hidden');
            qrContainer.classList.add('show');
        } else {
            // Esconder container
            qrContainer.classList.remove('show');
            qrContainer.classList.add('hidden');
        }
    } catch (e) {
        console.error('Erro ao alternar código QR:', e);
    }
}

// Exibir notificação toast
function showToast(message) {
    try {
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
    } catch (e) {
        console.error('Erro ao mostrar toast:', e);
    }
}

// Mostrar resultados do sorteio
function showResults() {
    try {
        // Para um demo, vamos mostrar um resultado aleatório
        if (!currentResult && results.length > 0) {
            const randomIndex = Math.floor(Math.random() * results.length);
            currentResult = results[randomIndex];
        }
        
        if (!currentResult) return;
        
        // Mostrar o nome do amigo sorteado na modal
        if (friendName) friendName.textContent = currentResult.receiver;
        
        // Mostrar o modal com efeito de fade
        if (resultSection) resultSection.classList.add('show');
        
        // Iniciar animação de fogos de artifício
        startFireworks();
        
        // Aplicar animação ao nome
        if (friendName) {
            friendName.style.animation = 'none';
            void friendName.offsetWidth; // Reiniciar animação
            friendName.style.animation = 'fadeInUp 0.8s forwards';
        }
    } catch (e) {
        console.error('Erro ao mostrar resultados:', e);
    }
}

// Fechar modal de resultados
function closeResultModal() {
    try {
        if (resultSection) resultSection.classList.remove('show');
        stopFireworks();
        
        // Esconder o QR code se estiver visível
        if (qrContainer) {
            qrContainer.classList.add('hidden');
            qrContainer.classList.remove('show');
        }
    } catch (e) {
        console.error('Erro ao fechar modal de resultados:', e);
    }
}

// Adicionar participante
function addParticipant() {
    try {
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
            if (participants.length >= 2 && drawButton) {
                drawButton.disabled = false;
            }
        }
    } catch (e) {
        console.error('Erro ao adicionar participante:', e);
    }
}

// Atualizar lista de participantes
function updateParticipantsList() {
    try {
        if (!participantsList) return;
        
        // Limpar lista
        participantsList.innerHTML = '';
        
        // Atualizar contador
        if (participantsCount) {
            participantsCount.textContent = participants.length;
        }
        
        // Desabilitar botão de sorteio se não tiver pelo menos 2 participantes
        if (drawButton) {
            drawButton.disabled = participants.length < 2;
        }
        
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
    } catch (e) {
        console.error('Erro ao atualizar lista de participantes:', e);
    }
}

// Remover participante
function removeParticipant(id) {
    try {
        // Filtrar o participante a ser removido
        participants = participants.filter(p => p.id !== id);
        
        // Atualizar localStorage
        localStorage.setItem('amigoSecreto_participants', JSON.stringify(participants));
        
        // Atualizar UI
        updateParticipantsList();
    } catch (e) {
        console.error('Erro ao remover participante:', e);
    }
}

// Desenhar amigos secretos
function drawSecretFriends() {
    try {
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
        if (resultList) {
            resultList.innerHTML = '';
            resultList.classList.remove('hidden');
            
            const successMessage = document.createElement('div');
            successMessage.textContent = 'Sorteio realizado com sucesso! Clique nos nomes para ver o resultado.';
            successMessage.className = 'success';
            resultList.appendChild(successMessage);
        }
        
        // Tornar nomes clicáveis para revelar
        makeNamesClickable();
    } catch (e) {
        console.error('Erro ao sortear amigos secretos:', e);
    }
}

// Tornar nomes clicáveis
function makeNamesClickable() {
    try {
        // Adicionar efeitos visuais e interação para cada participante na lista
        const nameItems = document.querySelectorAll('.name-item');
        
        nameItems.forEach((nameItem, index) => {
            // Estilos para indicar clicabilidade
            nameItem.style.cursor = 'pointer';
            nameItem.style.transition = 'all 0.2s ease';
            
            // Remover event listener anterior (se houver)
            const newNameItem = nameItem.cloneNode(true);
            nameItem.parentNode.replaceChild(newNameItem, nameItem);
            
            // Adicionar evento de clique
            newNameItem.addEventListener('click', () => {
                // Encontrar resultado correspondente ao clicado
                const participantName = newNameItem.textContent;
                const result = results.find(r => r.giver === participantName);
                
                if (result) {
                    currentResult = result;
                    showResults();
                }
            });
            
            // Efeitos de hover
            newNameItem.addEventListener('mouseover', () => {
                newNameItem.style.color = '#BA55D3';
                newNameItem.style.transform = 'translateX(5px)';
            });
            
            newNameItem.addEventListener('mouseout', () => {
                newNameItem.style.color = '';
                newNameItem.style.transform = '';
            });
        });
    } catch (e) {
        console.error('Erro ao tornar nomes clicáveis:', e);
    }
}

// Iniciar fogos de artifício
function startFireworks() {
    try {
        // Tornar o canvas visível
        fireworksCanvas = document.querySelector('.fireworks-canvas');
        if (fireworksCanvas) {
            fireworksCanvas.style.display = 'block';
            
            // Ativar os fogos
            fireworksActive = true;
            
            // Começar animação
            if (!fireworksAnimationId) {
                animate();
            }
        }
    } catch (e) {
        console.error('Erro ao iniciar fogos de artifício:', e);
    }
}

// Parar fogos de artifício
function stopFireworks() {
    try {
        fireworksActive = false;
        
        if (fireworksAnimationId) {
            cancelAnimationFrame(fireworksAnimationId);
            fireworksAnimationId = null;
        }
        
        // Esconder o canvas
        fireworksCanvas = document.querySelector('.fireworks-canvas');
        if (fireworksCanvas) {
            fireworksCanvas.style.display = 'none';
            // Limpar o canvas
            ctxFireworks = fireworksCanvas.getContext('2d');
            if (ctxFireworks) {
                ctxFireworks.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
            }
        }
        
        // Limpar arrays
        fireworks = [];
        particles = [];
    } catch (e) {
        console.error('Erro ao parar fogos de artifício:', e);
    }
}

// Inicializar fogos de artifício
function initFireworks() {
    try {
        fireworksCanvas = document.querySelector('.fireworks-canvas');
        if (!fireworksCanvas) {
            console.error('Canvas de fogos de artifício não encontrado');
            return;
        }
        
        fireworksCanvas.width = window.innerWidth;
        fireworksCanvas.height = window.innerHeight;
        ctxFireworks = fireworksCanvas.getContext('2d');
        
        // Inicializar arrays
        fireworks = [];
        particles = [];
    } catch (e) {
        console.error('Erro ao inicializar fogos de artifício:', e);
    }
}

// Função para animar fogos de artifício
function animate() {
    try {
        // Verificar se a animação deve continuar
        if (!fireworksActive) return;
        
        // Continuar a animação
        fireworksAnimationId = requestAnimationFrame(animate);
        
        if (!fireworksCanvas || !ctxFireworks) {
            fireworksCanvas = document.querySelector('.fireworks-canvas');
            if (!fireworksCanvas) return;
            ctxFireworks = fireworksCanvas.getContext('2d');
            if (!ctxFireworks) return;
        }
        
        // Limpar o canvas com um efeito de fade
        ctxFireworks.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctxFireworks.fillRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
        
        // Adicionar novos fogos de artifício aleatoriamente
        if (Math.random() < 0.05) {
            createFirework();
        }
        
        // Atualizar e desenhar fogos existentes
        updateFireworks();
    } catch (e) {
        console.error('Erro na animação de fogos de artifício:', e);
        stopFireworks();
    }
}

// Criar um novo fogo de artifício
function createFirework() {
    try {
        if (!fireworksCanvas) return;
        
        const x = Math.random() * fireworksCanvas.width;
        const y = fireworksCanvas.height;
        const targetY = Math.random() * fireworksCanvas.height * 0.6;
        
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
    } catch (e) {
        console.error('Erro ao criar fogo de artifício:', e);
    }
}

// Atualizar posição dos fogos de artifício
function updateFireworks() {
    try {
        if (!fireworksCanvas || !ctxFireworks) return;
        
        for (let i = fireworks.length - 1; i >= 0; i--) {
            const fw = fireworks[i];
            
            // Atualizar posição
            fw.x += fw.vel.x;
            fw.y += fw.vel.y;
            
            // Desenhar o fogo
            ctxFireworks.beginPath();
            ctxFireworks.arc(fw.x, fw.y, 3, 0, Math.PI * 2);
            ctxFireworks.fillStyle = fw.color;
            ctxFireworks.fill();
            
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
                    
                    ctxFireworks.globalAlpha = p.alpha;
                    ctxFireworks.beginPath();
                    ctxFireworks.arc(p.x, p.y, 2, 0, Math.PI * 2);
                    ctxFireworks.fillStyle = fw.color;
                    ctxFireworks.fill();
                    
                    if (p.alpha <= 0) {
                        fw.particles.splice(j, 1);
                    }
                }
                
                if (fw.particles.length === 0) {
                    fireworks.splice(i, 1);
                }
            }
        }
        
        ctxFireworks.globalAlpha = 1;
    } catch (e) {
        console.error('Erro ao atualizar fogos de artifício:', e);
    }
}

// Explodir um fogo de artifício
function explodeFirework(fw) {
    try {
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
    } catch (e) {
        console.error('Erro ao explodir fogo de artifício:', e);
    }
}

// Gerar uma cor aleatória para os fogos de artifício
function getRandomFireworkColor() {
    try {
        const colors = [
            '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
            '#FF00FF', '#00FFFF', '#FFA500', '#FF1493',
            '#FFD700', '#7CFC00', '#BA55D3', '#FF6347'
        ];
        
        return colors[Math.floor(Math.random() * colors.length)];
    } catch (e) {
        console.error('Erro ao gerar cor aleatória:', e);
        return '#FFFFFF';
    }
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
    try {
        // Atualizar tamanho dos canvas
        if (confettiCanvas) {
            confettiCanvas.width = window.innerWidth;
            confettiCanvas.height = window.innerHeight;
        }
        
        if (fireworksCanvas) {
            fireworksCanvas.width = window.innerWidth;
            fireworksCanvas.height = window.innerHeight;
        }
        
        // Atualizar demais elementos responsivos (como Three.js)
    } catch (e) {
        console.error('Erro ao redimensionar janela:', e);
    }
}

// Função para rastrear movimento do mouse
function onMouseMove(event) {
    try {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    } catch (e) {
        console.error('Erro ao rastrear movimento do mouse:', e);
    }
}

// Funções vazias para evitar erros se não existirem
function initSnowSystem() {
    console.log('Função initSnowSystem não implementada');
}

function initPresentModel() {
    console.log('Função initPresentModel não implementada');
}

function createStars() {
    console.log('Função createStars não implementada');
}

function initElementAnimations() {
    console.log('Função initElementAnimations não implementada');
}

function setupAnimations() {
    console.log('Função setupAnimations não implementada');
}

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando aplicação de Amigo Secreto');
    try {
        if (typeof setupAnimations === 'function') {
            setupAnimations();
        }
        init();
    } catch (e) {
        console.error('Erro ao inicializar aplicação:', e);
    }
});