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

// Arrays para armazenar participantes e resultados
let participants = [];
let results = [];

// Configuração do canvas para confete
const ctx = confettiCanvas.getContext('2d');
let confettiActive = false;
let confettiPieces = [];
const colors = ['#8A2BE2', '#9370DB', '#BA55D3', '#FF69B4', '#FFD700', '#00BFFF', '#32CD32'];

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
    window.addEventListener('resize', updateCanvasSize);
}

// Atualizar tamanho do canvas ao redimensionar janela
function updateCanvasSize() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
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
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = participant;
        nameSpan.classList.add('name-item');
        
        const deleteButton = document.createElement('img');
        deleteButton.src = 'https://img.icons8.com/ios-glyphs/30/ffffff/trash--v1.png';
        deleteButton.alt = 'Remover';
        deleteButton.classList.add('trash-icon');
        deleteButton.onclick = () => removeParticipant(index);
        
        li.appendChild(nameSpan);
        li.appendChild(deleteButton);
        participantsList.appendChild(li);
    });
    
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

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', init);