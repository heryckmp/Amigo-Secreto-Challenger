// Elementos do DOM
const inputName = document.getElementById('inputName');
const addButton = document.getElementById('addButton');
const participantsList = document.getElementById('participantsList');
const participantsCount = document.getElementById('participantsCount');
const drawButton = document.getElementById('drawButton');
const resultSection = document.getElementById('resultSection');
const friendName = document.getElementById('friendName');
const friendAvatar = document.getElementById('friendAvatar');
const closeResult = document.getElementById('closeResult');
const copyLinkButton = document.getElementById('copyLinkButton');
const showQRButton = document.getElementById('showQRButton');
const qrContainer = document.getElementById('qrContainer');
const toast = document.getElementById('toast');
const fireworksCanvas = document.getElementById('fireworks-canvas');
const photoInput = document.getElementById('photoInput');
const photoPreview = document.getElementById('photoPreview');
const photoInputContainer = document.querySelector('.photo-preview');

// Variáveis para armazenar participantes e resultados do sorteio
let participants = [];
let drawResults = {};
let currentPhoto = null;
let fireworksActive = false;

// Inicialização
function init() {
    // Limpar dados do localStorage ao iniciar
    localStorage.removeItem('participants');
    
    // Apenas configura os event listeners
    addButton.addEventListener('click', addParticipant);
    inputName.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            addParticipant();
        }
    });
    
    drawButton.addEventListener('click', drawNames);
    closeResult.addEventListener('click', hideResults);
    copyLinkButton.addEventListener('click', copyResultLink);
    showQRButton.addEventListener('click', toggleQRCode);
    
    // Event listener para input de foto
    photoInputContainer.addEventListener('click', function() {
        photoInput.click();
    });
    
    photoInput.addEventListener('change', handlePhotoChange);
    
    // Verifica se há um resultado para mostrar (vindo de um link compartilhado)
    checkForSharedResult();
}

// Função para lidar com a mudança de foto
function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            currentPhoto = event.target.result;
            updatePhotoPreview(currentPhoto);
        };
        reader.readAsDataURL(file);
    }
}

// Atualiza a pré-visualização da foto
function updatePhotoPreview(photoData) {
    if (photoData) {
        photoPreview.src = photoData;
        photoPreview.style.display = 'block';
        document.querySelector('.add-photo-label').style.display = 'none';
    } else {
        photoPreview.style.display = 'none';
        document.querySelector('.add-photo-label').style.display = 'block';
    }
}

// Limpa a pré-visualização da foto
function clearPhotoPreview() {
    photoPreview.src = '';
    photoPreview.style.display = 'none';
    document.querySelector('.add-photo-label').style.display = 'block';
    currentPhoto = null;
    photoInput.value = '';
}

// Adiciona um participante à lista
function addParticipant() {
    const name = inputName.value.trim();
    
    if (name === '') {
        shakeElement(inputName);
        return;
    }
    
    if (participants.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        shakeElement(inputName);
        showToast('Este nome já foi adicionado');
        return;
    }
    
    // Adiciona o participante com ou sem foto
    const participant = {
        id: Date.now().toString(),
        name: name,
        photo: currentPhoto
    };
    
    participants.push(participant);
    updateParticipantList();
    
    // Limpa campos e atualiza estado
    inputName.value = '';
    clearPhotoPreview();
    
    // Habilita o botão de sorteio se houver pelo menos 3 participantes
    if (participants.length >= 3) {
        drawButton.disabled = false;
    }
}

// Atualiza a lista de participantes na UI
function updateParticipantList() {
    participantsList.innerHTML = '';
    participantsCount.textContent = participants.length;
    
    participants.forEach(participant => {
        const li = document.createElement('li');
        
        // Cria o HTML para a lista de participantes
        li.innerHTML = `
            <div class="participant-info">
                <div class="participant-thumbnail">
                    ${participant.photo ? `<img src="${participant.photo}" alt="${participant.name}">` : ''}
                </div>
                <span class="name-item">${participant.name}</span>
            </div>
            <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXRyYXNoLTIiPjxwYXRoIGQ9Ik0zIDYoaW5WYWx1ZSB2MHY0RTZJTnUdWR2YDK2gGVvdm5ldGlL01RzcGlN="
                class="trash-icon" data-id="${participant.id}">
        `;
        
        // Adiciona o evento para remover o participante
        const trashIcon = li.querySelector('.trash-icon');
        trashIcon.addEventListener('click', function() {
            removeParticipant(participant.id);
        });
        
        // Adiciona o elemento à lista
        participantsList.appendChild(li);
    });
    
    // Anima a entrada dos itens
    const items = participantsList.querySelectorAll('li');
    items.forEach((item, index) => {
        item.style.opacity = 0;
        setTimeout(() => {
            item.style.opacity = 1;
            item.style.transform = 'translateX(0)';
        }, index * 100);
    });
}

// Remove um participante da lista
function removeParticipant(id) {
    participants = participants.filter(p => p.id !== id);
    updateParticipantList();
    
    // Desabilita o botão de sorteio se houver menos de 3 participantes
    if (participants.length < 3) {
        drawButton.disabled = true;
    }
}

// Realiza o sorteio dos nomes
function drawNames() {
    if (participants.length < 3) {
        showToast('É preciso pelo menos 3 participantes');
        return;
    }
    
    // Algoritmo de sorteio para garantir que ninguém tire o próprio nome
    let available = [...participants];
    drawResults = {};
    
    for (let i = 0; i < participants.length; i++) {
        const currentPerson = participants[i];
        let validChoices = available.filter(p => p.id !== currentPerson.id);
        
        // Se não houver escolhas válidas, recomeça o sorteio
        if (validChoices.length === 0) {
            return drawNames();
        }
        
        // Escolhe aleatoriamente um amigo secreto para a pessoa atual
        const randomIndex = Math.floor(Math.random() * validChoices.length);
        const secretFriend = validChoices[randomIndex];
        
        // Registra o resultado e remove o amigo sorteado das opções disponíveis
        drawResults[currentPerson.id] = secretFriend;
        available = available.filter(p => p.id !== secretFriend.id);
    }
    
    // Verifica se alguém ficou sem amigo secreto
    if (Object.keys(drawResults).length !== participants.length) {
        return drawNames();
    }
    
    // Mostra automaticamente o resultado para o primeiro participante
    showResultFor(participants[0].id);
    
    showToast('Sorteio realizado! O resultado está sendo exibido');
}

// Mostra o resultado para um participante específico
function showResultFor(participantId) {
    const secretFriend = drawResults[participantId];
    
    if (secretFriend) {
        // Define o nome do amigo secreto
        friendName.textContent = secretFriend.name;
        
        // Define a imagem do avatar, se disponível
        if (secretFriend.photo) {
            friendAvatar.innerHTML = `<img src="${secretFriend.photo}" alt="${secretFriend.name}">`;
        } else {
            friendAvatar.innerHTML = ''; // Mantém apenas o círculo gradiente
        }
        
        // Mostra a seção de resultado
        resultSection.classList.add('show');
        
        // Cria o QR code
        generateQRCode(participantId);
        
        // Inicia os fogos de artifício
        startFireworks();
    }
}

// Esconde a seção de resultados
function hideResults() {
    resultSection.classList.remove('show');
    stopFireworks();
    qrContainer.classList.add('hidden');
}

// Verifica se há um resultado compartilhado via URL
function checkForSharedResult() {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('share');
    
    if (sharedData) {
        try {
            const { personId, personName, friendName, friendPhoto } = JSON.parse(atob(sharedData));
            
            if (personName && friendName) {
                // Define o resultado compartilhado
                document.getElementById('friendName').textContent = friendName;
                
                // Define a imagem, se disponível
                if (friendPhoto) {
                    friendAvatar.innerHTML = `<img src="${friendPhoto}" alt="${friendName}">`;
                } else {
                    friendAvatar.innerHTML = '';
                }
                
                // Esconde os botões de compartilhamento
                document.querySelector('.share-section').style.display = 'none';
                
                // Mostra o resultado
                resultSection.classList.add('show');
                startFireworks();
            }
        } catch (error) {
            console.error('Erro ao decodificar dados compartilhados:', error);
        }
    }
}

// Copia o link do resultado para a área de transferência
function copyResultLink() {
    const selectedPersonId = getSelectedPersonId();
    
    if (selectedPersonId) {
        const person = participants.find(p => p.id === selectedPersonId);
        const friend = drawResults[selectedPersonId];
        
        // Compacta apenas os dados necessários
        const shareData = {
            personId: selectedPersonId,
            personName: person.name,
            friendName: friend.name,
            friendPhoto: friend.photo
        };
        
        // Codifica os dados para compartilhamento via URL
        const encodedData = btoa(JSON.stringify(shareData));
        const shareUrl = `${window.location.origin}${window.location.pathname}?share=${encodedData}`;
        
        // Copia para a área de transferência
        navigator.clipboard.writeText(shareUrl).then(() => {
            showToast('Link copiado com sucesso!');
        }).catch(err => {
            console.error('Erro ao copiar:', err);
            showToast('Não foi possível copiar o link');
        });
    }
}

// Obtém o ID do participante selecionado
function getSelectedPersonId() {
    const friendNameText = friendName.textContent;
    // Encontra quem tirou esta pessoa
    for (const [personId, friend] of Object.entries(drawResults)) {
        if (friend.name === friendNameText) {
            return personId;
        }
    }
    return null;
}

// Gera e mostra o QR Code para compartilhamento
function generateQRCode(participantId) {
    const person = participants.find(p => p.id === participantId);
    const friend = drawResults[participantId];
    
    // Compacta apenas os dados necessários
    const shareData = {
        personId: participantId,
        personName: person.name,
        friendName: friend.name,
        friendPhoto: friend.photo
    };
    
    // Codifica os dados para compartilhamento via URL
    const encodedData = btoa(JSON.stringify(shareData));
    const shareUrl = `${window.location.origin}${window.location.pathname}?share=${encodedData}`;
    
    // Limpa o container e gera um novo QR code
    document.getElementById('qrcode').innerHTML = '';
    new QRCode(document.getElementById('qrcode'), {
        text: shareUrl,
        width: 180,
        height: 180,
        colorDark: '#8A2BE2',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });
}

// Alterna a visibilidade do QR Code
function toggleQRCode() {
    qrContainer.classList.toggle('hidden');
    qrContainer.classList.toggle('show');
}

// Mostra um toast de notificação
function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Efeito de shake para elementos inválidos
function shakeElement(element) {
    element.classList.add('shake');
    setTimeout(() => {
        element.classList.remove('shake');
    }, 500);
}

// Efeito de fogos de artifício
function startFireworks() {
    const canvas = fireworksCanvas;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const fireworks = [];
    const maxFireworks = 8;
    const maxSparks = 80;
    
    // Inicializa os fogos de artifício
    for (let i = 0; i < maxFireworks; i++) {
        let firework = {
            sparks: []
        };
        
        for (let n = 0; n < maxSparks; n++) {
            let spark = {
                vx: Math.random() * 5 + 0.5,
                vy: Math.random() * 5 + 0.5,
                weight: Math.random() * 0.3 + 0.03,
                // Cores vibrantes para os fogos
                red: Math.floor(Math.random() * 255),
                green: Math.floor(Math.random() * 255),
                blue: Math.floor(Math.random() * 255)
            };
            
            if (Math.random() > 0.5) spark.vx = -spark.vx;
            if (Math.random() > 0.5) spark.vy = -spark.vy;
            firework.sparks.push(spark);
        }
        
        fireworks.push(firework);
        resetFirework(firework);
    }
    
    function resetFirework(firework) {
        firework.x = Math.floor(Math.random() * canvas.width);
        firework.y = canvas.height;
        firework.age = 0;
        firework.phase = 'fly';
    }
    
    function animateFireworks() {
        // Limpa o canvas com um pouco de transparência para criar efeito de rastro
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        fireworks.forEach((firework, index) => {
            if (firework.phase === 'explode') {
                firework.sparks.forEach((spark) => {
                    for (let i = 0; i < 5; i++) {
                        let trailAge = firework.age + i;
                        let x = firework.x + spark.vx * trailAge;
                        let y = firework.y + spark.vy * trailAge + spark.weight * trailAge * spark.weight * trailAge;
                        let fade = i * 15 - firework.age * 1.5;
                        
                        if (fade > 0) {
                            let r = Math.floor(spark.red * fade);
                            let g = Math.floor(spark.green * fade);
                            let b = Math.floor(spark.blue * fade);
                            
                            ctx.beginPath();
                            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${fade / 15})`;
                            
                            // Varia entre formatos para cada partícula
                            const shape = Math.floor(Math.random() * 3);
                            if (shape === 0) {
                                // Círculo
                                ctx.arc(x, y, 1.5, 0, Math.PI * 2);
                            } else if (shape === 1) {
                                // Quadrado
                                ctx.fillRect(x, y, 3, 3);
                            } else {
                                // Linha
                                ctx.fillRect(x, y, 4, 1);
                            }
                            
                            ctx.fill();
                        }
                    }
                });
                
                firework.age++;
                
                // Reseta o foguete após certo tempo
                if (firework.age > 80 && Math.random() < 0.05) {
                    resetFirework(firework);
                }
            } else {
                // Fase de voo do foguete
                firework.y = firework.y - 10;
                
                // Rastro do foguete
                for (let i = 0; i < 5; i++) {
                    ctx.beginPath();
                    ctx.fillStyle = `rgba(255, ${150 + Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)}, ${1 - i * 0.2})`;
                    ctx.arc(
                        firework.x + Math.random() * 2 - 1, 
                        firework.y + i * 5, 
                        2, 
                        0, 
                        Math.PI * 2
                    );
                    ctx.fill();
                }
                
                // Explode quando chega a certa altura ou aleatoriamente
                if (Math.random() < 0.005 || firework.y < canvas.height * 0.3) {
                    firework.phase = 'explode';
                }
            }
        });
        
        if (fireworksActive) {
            requestAnimationFrame(animateFireworks);
        }
    }
    
    // Inicia a animação
    fireworksActive = true;
    animateFireworks();
}

// Parar os fogos de artifício
function stopFireworks() {
    fireworksActive = false;
}

// Setup da neve com Three.js
function setupSnow() {
    // Cria a cena
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // Configura o renderer
    const renderer = new THREE.WebGLRenderer({ 
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    document.querySelector('.canvas-container').appendChild(renderer.domElement);
    
    // Cria os flocos de neve
    const snowflakeCount = 1000;
    const snowflakeGeometry = new THREE.BufferGeometry();
    const snowflakePositions = [];
    const snowflakeSizes = [];
    
    for (let i = 0; i < snowflakeCount; i++) {
        snowflakePositions.push(
            (Math.random() - 0.5) * 50, // x
            (Math.random() - 0.5) * 50, // y
            (Math.random() - 0.5) * 50  // z
        );
        
        snowflakeSizes.push(Math.random() * 5 + 1);
    }
    
    snowflakeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(snowflakePositions, 3));
    snowflakeGeometry.setAttribute('size', new THREE.Float32BufferAttribute(snowflakeSizes, 1));
    
    // Material para os flocos de neve
    const snowflakeMaterial = new THREE.PointsMaterial({ 
        color: 0xFFFFFF,
        size: 0.5,
        transparent: true,
        opacity: 0.8,
        map: createSnowflakeTexture(),
        depthWrite: false
    });
    
    // Cria os pontos
    const snowflakes = new THREE.Points(snowflakeGeometry, snowflakeMaterial);
    scene.add(snowflakes);
    
    // Posiciona a câmera
    camera.position.z = 20;
    
    // Função para animar a neve
    function animateSnow() {
        requestAnimationFrame(animateSnow);
        
        // Atualiza a posição dos flocos de neve
        const positions = snowflakeGeometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            // Move para baixo
            positions[i + 1] -= 0.05 * (snowflakeSizes[i / 3] / 2);
            
            // Move levemente para os lados
            positions[i] += Math.sin(Date.now() * 0.001 + i) * 0.01;
            
            // Resetar quando atingir o limite inferior
            if (positions[i + 1] < -25) {
                positions[i + 1] = 25;
                positions[i] = (Math.random() - 0.5) * 50;
            }
        }
        
        snowflakeGeometry.attributes.position.needsUpdate = true;
        
        // Renderiza a cena
        renderer.render(scene, camera);
    }
    
    // Redimensiona o canvas quando a janela for redimensionada
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Inicia a animação
    animateSnow();
}

// Cria uma textura para os flocos de neve
function createSnowflakeTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext('2d');
    
    // Fundo transparente
    context.fillStyle = 'rgba(0, 0, 0, 0)';
    context.fillRect(0, 0, 32, 32);
    
    // Desenha o floco de neve
    context.fillStyle = 'white';
    context.beginPath();
    context.arc(16, 16, 7, 0, Math.PI * 2, false);
    context.fill();
    
    // Adiciona um brilho
    const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 8);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(16, 16, 8, 0, Math.PI * 2, false);
    context.fill();
    
    // Cria a textura
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
}

// Inicia a aplicação
document.addEventListener('DOMContentLoaded', function() {
    init();
    setupSnow();
});