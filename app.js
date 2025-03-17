// Elementos do DOM
let participantsList = [];
let results = [];
let currentResult = null;
let isDrawing = false;

// Elementos do DOM
const nameInput = document.getElementById('name-input');
const addButton = document.getElementById('add-button');
const participantsUl = document.getElementById('participants-list');
const drawButton = document.getElementById('draw-button');
const resultList = document.getElementById('result-list');
const countElement = document.getElementById('participants-count');
const resultSection = document.getElementById('result-section');
const friendName = document.getElementById('friend-name');
const avatarCircle = document.getElementById('avatar-circle');
const closeButton = document.getElementById('close-button');
const shareButton = document.getElementById('share-button');
const qrButton = document.getElementById('qr-button');
const qrContainer = document.getElementById('qr-container');
const copyLinkBtn = document.getElementById('copy-link-btn');
const toastNotification = document.getElementById('toast-notification');
const confettiCanvas = document.getElementById('confetti-canvas');

// Elementos de foto
const photoInput = document.getElementById('photo-input');
const photoPreview = document.getElementById('photo-preview');
const previewImage = document.getElementById('preview-image');

// CONFETTI.JS
// Adaptado de https://www.kirilv.com/canvas-confetti/
const confetti = {
    canvas: null,
    context: null,
    particles: [],
    colors: ['#8A2BE2', '#9370DB', '#BA55D3', '#FF69B4', '#FFD700'],
    
    init: function() {
        this.canvas = confettiCanvas;
        this.context = this.canvas.getContext('2d');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.particles = [];
    },
    
    create: function() {
        const particles = this.particles;
        
        // Criando partículas
        for (let i = 0; i < 150; i++) {
            particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * -this.canvas.height,
                r: Math.random() * 6 + 2, // raio
                d: Math.random() * 150 + 50, // densidade
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                tilt: Math.floor(Math.random() * 10) - 10,
                tiltAngle: 0,
                tiltAngleIncrement: Math.random() * 0.07 + 0.05
            });
        }
    },
    
    draw: function() {
        const ctx = this.context;
        const particles = this.particles;
        const canvas = this.canvas;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(function(p, i) {
            ctx.beginPath();
            ctx.fillStyle = p.color;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + p.tilt + p.r, p.y + p.tilt);
            ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
            ctx.closePath();
            ctx.fill();
            
            // Atualizando posição
            p.tiltAngle += p.tiltAngleIncrement;
            p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
            p.tilt = Math.sin(p.tiltAngle) * 15;
            
            // Se a partícula sair da tela, reposicionar
            if (p.y > canvas.height) {
                if (i % 5 > 0 || i % 2 == 0) { // 40% das partículas
                    particles[i] = {
                        x: Math.random() * canvas.width,
                        y: Math.random() * -canvas.height,
                        r: p.r,
                        d: p.d,
                        color: p.color,
                        tilt: Math.floor(Math.random() * 10) - 10,
                        tiltAngle: p.tiltAngle,
                        tiltAngleIncrement: p.tiltAngleIncrement
                    };
                }
            }
        });
    },
    
    animate: function() {
        this.draw();
        if (this.particles.length > 0) {
            window.requestAnimationFrame(this.animate.bind(this));
        } else {
            this.canvas.style.display = 'none';
        }
    },
    
    start: function() {
        this.init();
        this.create();
        this.canvas.style.display = 'block';
        window.requestAnimationFrame(this.animate.bind(this));
    },
    
    stop: function() {
        this.particles = [];
    }
};

// Inicializar o aplicativo
function init() {
    // Remover dados salvos no localStorage ao iniciar a aplicação
    localStorage.removeItem('participants');
    participantsList = [];
    results = [];
    updateParticipantsList();
    
    addButton.addEventListener('click', addParticipant);
    nameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addParticipant();
    });
    drawButton.addEventListener('click', startDraw);
    closeButton.addEventListener('click', closeResultModal);
    shareButton.addEventListener('click', copyLinkToClipboard);
    qrButton.addEventListener('click', toggleQRCode);
    copyLinkBtn.addEventListener('click', copyLinkToClipboard);
    
    // Event listener para o input de foto
    photoInput.addEventListener('change', handlePhotoChange);
    photoPreview.addEventListener('click', function() {
        photoInput.click();
    });
    
    // Verificar se há um resultado compartilhado na URL
    checkSharedResult();
    
    // Limpar a foto ao iniciar
    previewImage.style.display = 'none';
    
    // Adicionar tooltip ao elemento photo-preview
    photoPreview.setAttribute('title', 'Adicionar foto (opcional)');
}

// Handler para alteração de foto
function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            updatePhotoPreview(event.target.result);
        };
        reader.readAsDataURL(file);
    }
}

// Atualizar a visualização da foto
function updatePhotoPreview(dataUrl) {
    previewImage.src = dataUrl;
    previewImage.style.display = 'block';
}

// Limpar a visualização da foto
function clearPhotoPreview() {
    previewImage.src = '';
    previewImage.style.display = 'none';
    photoInput.value = '';
}

// Adicionar participante
function addParticipant() {
    const name = nameInput.value.trim();
    if (name === '') {
        showMessage('Por favor, digite um nome.', 'error');
        return;
    }
    
    if (participantsList.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        showMessage('Este nome já foi adicionado.', 'error');
        return;
    }
    
    // Criar objeto participante com nome e foto (se houver)
    const participant = {
        name: name,
        photo: previewImage.style.display === 'none' ? null : previewImage.src
    };
    
    participantsList.push(participant);
    updateParticipantsList();
    
    // Limpar inputs
    nameInput.value = '';
    clearPhotoPreview();
    nameInput.focus();
    
    showMessage(`${name} foi adicionado à lista!`, 'success');
}

// Remover participante
function removeParticipant(index) {
    participantsList.splice(index, 1);
    updateParticipantsList();
}

// Atualizar lista de participantes
function updateParticipantsList() {
    participantsUl.innerHTML = '';
    countElement.textContent = participantsList.length;
    
    participantsList.forEach((participant, index) => {
        const li = document.createElement('li');
        
        // Criar container para informações do participante
        const infoDiv = document.createElement('div');
        infoDiv.className = 'participant-info';
        
        // Criar thumbnail com foto ou gradiente
        const thumbnailDiv = document.createElement('div');
        thumbnailDiv.className = 'participant-thumbnail';
        
        if (participant.photo) {
            const img = document.createElement('img');
            img.src = participant.photo;
            img.alt = `Foto de ${participant.name}`;
            thumbnailDiv.appendChild(img);
        }
        
        // Criar span para o nome
        const nameSpan = document.createElement('span');
        nameSpan.className = 'name-item';
        nameSpan.textContent = participant.name;
        
        // Adicionar thumbnail e nome ao container de info
        infoDiv.appendChild(thumbnailDiv);
        infoDiv.appendChild(nameSpan);
        
        // Adicionar container de info ao li
        li.appendChild(infoDiv);
        
        // Criar ícone de lixeira para remover
        const trashIcon = document.createElement('img');
        trashIcon.src = 'https://api.iconify.design/mdi:trash-can-outline.svg';
        trashIcon.className = 'trash-icon';
        trashIcon.alt = 'Remover';
        trashIcon.addEventListener('click', () => removeParticipant(index));
        
        li.appendChild(trashIcon);
        participantsUl.appendChild(li);
    });
    
    // Atualizar estado do botão de sorteio
    updateDrawButtonState();
}

// Atualizar estado do botão de sorteio
function updateDrawButtonState() {
    if (participantsList.length < 3) {
        drawButton.disabled = true;
        drawButton.setAttribute('title', 'Adicione pelo menos 3 participantes');
    } else {
        drawButton.disabled = false;
        drawButton.removeAttribute('title');
    }
}

// Exibir mensagem
function showMessage(text, type) {
    resultList.textContent = text;
    resultList.className = 'result-list glass';
    resultList.classList.add(type);
    
    setTimeout(() => {
        resultList.textContent = '';
        resultList.className = 'result-list glass';
    }, 3000);
}

// Iniciar sorteio
function startDraw() {
    if (isDrawing) return;
    if (participantsList.length < 3) {
        showMessage('Adicione pelo menos 3 participantes para iniciar o sorteio.', 'error');
        return;
    }
    
    isDrawing = true;
    drawButton.disabled = true;
    
    // Animação de sorteio
    let shuffles = 0;
    const maxShuffles = 20;
    let shuffleInterval = setInterval(() => {
        if (shuffles >= maxShuffles) {
            clearInterval(shuffleInterval);
            completeDraw();
            return;
        }
        
        shuffles++;
        const randomIndex = Math.floor(Math.random() * participantsList.length);
        showMessage(`Sorteando... ${participantsList[randomIndex].name}`, 'success');
    }, 100);
}

// Completar sorteio
function completeDraw() {
    // Criar cópia do array de participantes
    const shuffledNames = [...participantsList];
    results = [];
    
    // Embaralhar array usando o algoritmo Fisher-Yates
    for (let i = shuffledNames.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledNames[i], shuffledNames[j]] = [shuffledNames[j], shuffledNames[i]];
    }
    
    // Atribuir amigo secreto a cada participante
    for (let i = 0; i < participantsList.length; i++) {
        const nextIndex = (i + 1) % participantsList.length;
        results.push({
            person: participantsList[i],
            friend: shuffledNames[nextIndex]
        });
    }
    
    showMessage('Sorteio realizado com sucesso! Clique nos nomes para ver os resultados.', 'success');
    
    // Atualizar lista com nomes clicáveis
    updateParticipantsListWithResults();
    
    isDrawing = false;
    drawButton.disabled = false;
}

// Atualizar lista com resultados
function updateParticipantsListWithResults() {
    participantsUl.innerHTML = '';
    
    participantsList.forEach((participant, index) => {
        const li = document.createElement('li');
        
        // Criar container para informações do participante
        const infoDiv = document.createElement('div');
        infoDiv.className = 'participant-info';
        
        // Criar thumbnail com foto ou gradiente
        const thumbnailDiv = document.createElement('div');
        thumbnailDiv.className = 'participant-thumbnail';
        
        if (participant.photo) {
            const img = document.createElement('img');
            img.src = participant.photo;
            img.alt = `Foto de ${participant.name}`;
            thumbnailDiv.appendChild(img);
        }
        
        // Criar span para o nome
        const nameSpan = document.createElement('span');
        nameSpan.className = 'name-item';
        nameSpan.textContent = participant.name;
        
        // Adicionar thumbnail e nome ao container de info
        infoDiv.appendChild(thumbnailDiv);
        infoDiv.appendChild(nameSpan);
        
        // Tornar o container clicável
        infoDiv.style.cursor = 'pointer';
        infoDiv.addEventListener('click', () => showResults(index));
        
        // Adicionar container de info ao li
        li.appendChild(infoDiv);
        li.style.cursor = 'pointer';
        
        participantsUl.appendChild(li);
    });
}

// Mostrar resultado
function showResults(index) {
    const result = results.find(r => r.person.name === participantsList[index].name);
    currentResult = result;
    
    // Exibir o nome do amigo
    friendName.textContent = result.friend.name;
    
    // Atualizar o avatar com a foto ou manter o gradiente
    if (result.friend.photo) {
        // Se tiver foto, criar e exibir a imagem
        if (!avatarCircle.querySelector('img')) {
            const img = document.createElement('img');
            avatarCircle.appendChild(img);
        }
        
        const img = avatarCircle.querySelector('img');
        img.src = result.friend.photo;
        img.alt = `Foto de ${result.friend.name}`;
        img.style.display = 'block';
    } else {
        // Se não tiver foto, remover imagem se existir
        const img = avatarCircle.querySelector('img');
        if (img) {
            img.style.display = 'none';
        }
    }
    
    // Mostrar o modal
    resultSection.classList.add('show');
    
    // Iniciar efeito de confetes
    confetti.start();
    
    // Esconder QR code caso esteja visível
    if (!qrContainer.classList.contains('hidden')) {
        qrContainer.classList.add('hidden');
    }
}

// Fechar modal de resultado
function closeResultModal() {
    resultSection.classList.remove('show');
    
    // Parar efeito de confetes após fechar o modal
    setTimeout(() => {
        confetti.stop();
    }, 500);
    
    // Esconder QR code caso esteja visível
    if (!qrContainer.classList.contains('hidden')) {
        qrContainer.classList.add('hidden');
    }
}

// Verificar resultado compartilhado na URL
function checkSharedResult() {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('result');
    
    if (sharedData) {
        try {
            const decodedData = JSON.parse(atob(sharedData));
            
            // Criar um resultado temporário
            currentResult = decodedData;
            
            // Mostrar resultado
            friendName.textContent = decodedData.friend.name;
            
            // Atualizar o avatar com a foto ou manter o gradiente
            if (decodedData.friend.photo) {
                // Se tiver foto, criar e exibir a imagem
                if (!avatarCircle.querySelector('img')) {
                    const img = document.createElement('img');
                    avatarCircle.appendChild(img);
                }
                
                const img = avatarCircle.querySelector('img');
                img.src = decodedData.friend.photo;
                img.alt = `Foto de ${decodedData.friend.name}`;
                img.style.display = 'block';
            } else {
                // Se não tiver foto, remover imagem se existir
                const img = avatarCircle.querySelector('img');
                if (img) {
                    img.style.display = 'none';
                }
            }
            
            // Mostrar o modal
            resultSection.classList.add('show');
            
            // Iniciar efeito de confetes
            confetti.start();
            
            // Limpar a URL para não mostrar novamente ao atualizar
            history.replaceState(null, '', window.location.pathname);
        } catch (error) {
            console.error('Erro ao decodificar dados compartilhados:', error);
        }
    }
}

// Copiar link para a área de transferência
function copyLinkToClipboard() {
    if (!currentResult) return;
    
    // Criar dados para compartilhar
    const shareData = {
        person: currentResult.person,
        friend: currentResult.friend
    };
    
    // Codificar dados em base64
    const encodedData = btoa(JSON.stringify(shareData));
    
    // Criar URL com os dados codificados
    const shareUrl = `${window.location.origin}${window.location.pathname}?result=${encodedData}`;
    
    // Copiar para área de transferência
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl)
            .then(() => showToast('Link copiado com sucesso!'))
            .catch(err => {
                console.error('Erro ao copiar:', err);
                fallbackCopyToClipboard(shareUrl);
            });
    } else {
        fallbackCopyToClipboard(shareUrl);
    }
}

// Método alternativo para copiar para a área de transferência
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = 0;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showToast('Link copiado com sucesso!');
        } else {
            showToast('Não foi possível copiar o link');
        }
    } catch (err) {
        console.error('Erro ao usar fallback para copiar:', err);
        showToast('Não foi possível copiar o link');
    }
    
    document.body.removeChild(textArea);
}

// Mostrar toast de notificação
function showToast(message) {
    toastNotification.textContent = message;
    toastNotification.classList.add('show');
    
    // Remover notificação após 3 segundos
    setTimeout(() => {
        toastNotification.classList.remove('show');
    }, 3000);
}

// Alternar visibilidade do QR code
function toggleQRCode() {
    if (!currentResult) return;
    
    if (qrContainer.classList.contains('hidden')) {
        // Criar código QR
        generateQRCode();
        qrContainer.classList.remove('hidden');
        setTimeout(() => qrContainer.classList.add('show'), 10);
    } else {
        qrContainer.classList.remove('show');
        setTimeout(() => qrContainer.classList.add('hidden'), 300);
    }
}

// Gerar código QR para compartilhamento
function generateQRCode() {
    if (!currentResult) return;
    
    // Criar dados para compartilhar
    const shareData = {
        person: currentResult.person,
        friend: currentResult.friend
    };
    
    // Codificar dados em base64
    const encodedData = btoa(JSON.stringify(shareData));
    
    // Criar URL com os dados codificados
    const shareUrl = `${window.location.origin}${window.location.pathname}?result=${encodedData}`;
    
    // Limpar container do QR code
    const qrcodeElement = document.getElementById('qrcode');
    qrcodeElement.innerHTML = '';
    
    // Gerar QR code usando o QRCode.js
    new QRCode(qrcodeElement, {
        text: shareUrl,
        width: 160,
        height: 160,
        colorDark: "#8A2BE2",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

// Inicializar
window.addEventListener('DOMContentLoaded', init);