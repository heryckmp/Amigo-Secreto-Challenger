// Elementos DOM
const inputName = document.getElementById('input-name');
const addButton = document.getElementById('add-button');
const participantsList = document.getElementById('participants-list');
const drawButton = document.getElementById('draw-button');
const participantsCount = document.getElementById('participants-count');
const resultSection = document.getElementById('result-section');
const resultContent = document.querySelector('.result-content');
const friendName = document.getElementById('friend-name');
const closeResultButton = document.getElementById('close-result');
const canvas = document.getElementById('confetti-canvas');
const copyLinkButton = document.getElementById('copy-link-button');
const showQrButton = document.getElementById('show-qr-button');
const qrContainer = document.getElementById('qr-container');
const qrcodeEl = document.getElementById('qrcode');
const photoInput = document.getElementById('user-photo');
const photoPreview = document.getElementById('photo-preview');
const avatarImage = document.getElementById('avatar-image');

// Arrays para armazenar participantes e resultados
let participants = [];
let results = [];
let currentResult = null; // Armazena o resultado atual para compartilhamento
let currentPhoto = null; // Armazena a foto atual sendo adicionada

// Inicialização
function init() {
    // Remover storage ao iniciar para que a lista seja limpa ao atualizar a página
    localStorage.removeItem('amigo-secreto-participants');
    
    // Configurar o tamanho do canvas para efeitos de confete
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Event listeners
    addButton.addEventListener('click', addParticipant);
    inputName.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addParticipant();
    });
    drawButton.addEventListener('click', drawNames);
    closeResultButton.addEventListener('click', closeResultModal);
    
    // Event listeners para compartilhamento
    copyLinkButton.addEventListener('click', copyShareLink);
    showQrButton.addEventListener('click', toggleQrCode);
    
    // Event listener para upload de foto
    photoInput.addEventListener('change', handlePhotoChange);
    photoPreview.addEventListener('click', () => photoInput.click());

    // Verificar se existe um resultado compartilhado na URL
    checkSharedResult();

    // Inicializar Three.js para efeitos de fundo
    initThreeJS();
    
    // Criar estrelas decorativas
    createStars();
}

// Função para lidar com a mudança da foto
function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Verificar se é uma imagem
    if (!file.type.match('image.*')) {
        alert('Por favor, selecione uma imagem');
        return;
    }
    
    // Ler o arquivo como base64
    const reader = new FileReader();
    reader.onload = function(e) {
        // Salvar a foto atual
        currentPhoto = e.target.result;
        
        // Atualizar a prévia
        updatePhotoPreview(currentPhoto);
    };
    reader.readAsDataURL(file);
}

// Função para atualizar a prévia da foto
function updatePhotoPreview(photoUrl) {
    // Limpar conteúdo anterior
    while (photoPreview.firstChild) {
        if (photoPreview.firstChild.tagName !== 'INPUT') {
            photoPreview.removeChild(photoPreview.firstChild);
        }
    }
    
    if (photoUrl) {
        // Esconder o '+' ao mostrar a foto
        const addLabel = photoPreview.querySelector('.add-photo-label');
        if (addLabel) addLabel.style.display = 'none';
        
        // Adicionar a imagem como background
        photoPreview.style.backgroundImage = `url(${photoUrl})`;
        photoPreview.style.backgroundSize = 'cover';
        photoPreview.style.backgroundPosition = 'center';
    } else {
        // Mostrar o '+' novamente se não houver foto
        const addLabel = photoPreview.querySelector('.add-photo-label');
        if (addLabel) addLabel.style.display = 'block';
        
        // Remover o background
        photoPreview.style.backgroundImage = 'none';
    }
}

// Verificar se existe um resultado compartilhado na URL
function checkSharedResult() {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('share');
    
    if (sharedData) {
        try {
            // Decodificar os dados compartilhados de Base64
            const decodedData = JSON.parse(atob(sharedData));
            
            // Verificar se os dados contêm as informações necessárias
            if (decodedData && decodedData.giver && decodedData.receiver) {
                // Se os participantes locais não incluem o giver, adicioná-lo
                if (!participants.some(p => p.name === decodedData.giver.name)) {
                    participants.push({
                        name: decodedData.giver.name,
                        photo: decodedData.giver.photo || null
                    });
                    updateParticipantsList();
                }
                
                // Mostrar o resultado compartilhado
                showSharedResult(decodedData);
            }
        } catch (error) {
            console.error('Erro ao processar dados compartilhados:', error);
        }
    }
}

// Mostrar resultado compartilhado
function showSharedResult(data) {
    // Atualizar o modal com o nome do amigo
    friendName.innerHTML = data.receiver.name;
    
    // Atualizar a foto do avatar se existir
    if (data.receiver.photo) {
        avatarImage.innerHTML = `<img src="${data.receiver.photo}" alt="${data.receiver.name}">`;
    } else {
        avatarImage.innerHTML = '';
    }
    
    // Mostrar o modal de resultado
    resultSection.classList.add('show');
    
    // Iniciar a animação de confete
    startConfetti();
    
    // Adicionar animação de fade-in para o nome do amigo
    setTimeout(() => {
        friendName.style.opacity = '0';
        friendName.style.animation = 'none';
        void friendName.offsetWidth; // Forçar reflow
        friendName.style.opacity = '';
        friendName.style.animation = '';
    }, 100);
}

// Gerar link de compartilhamento
function generateShareLink(result) {
    // Converter o resultado para uma string Base64
    const resultData = {
        giver: {
            name: result.giver.name,
            photo: result.giver.photo
        },
        receiver: {
            name: result.receiver.name,
            photo: result.receiver.photo
        }
    };
    
    const base64Data = btoa(JSON.stringify(resultData));
    
    // Construir a URL com o parâmetro de compartilhamento
    const shareUrl = `${window.location.origin}${window.location.pathname}?share=${base64Data}`;
    
    return shareUrl;
}

// Copiar link de compartilhamento
function copyShareLink() {
    if (!currentResult) return;
    
    const shareLink = generateShareLink(currentResult);
    
    // Usar a API moderna de clipboard se disponível
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareLink)
            .then(() => {
                showToast('Link copiado com sucesso!');
            })
            .catch(err => {
                console.error('Erro ao copiar link:', err);
                fallbackCopyTextToClipboard(shareLink);
            });
    } else {
        fallbackCopyTextToClipboard(shareLink);
    }
}

// Método alternativo para copiar para a área de transferência
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Tornar o textarea invisível
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    
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
        console.error('Erro ao copiar texto:', err);
        showToast('Não foi possível copiar o link');
    }
    
    document.body.removeChild(textArea);
}

// Alternar exibição do QR Code
function toggleQrCode() {
    if (!currentResult) return;
    
    if (qrContainer.classList.contains('hidden')) {
        // Limpar QR code anterior
        qrcodeEl.innerHTML = '';
        
        // Gerar link para compartilhamento
        const shareLink = generateShareLink(currentResult);
        
        // Criar o QR Code
        new QRCode(qrcodeEl, {
            text: shareLink,
            width: 170,
            height: 170,
            colorDark: "#8A2BE2",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        
        // Mostrar o container
        qrContainer.classList.remove('hidden');
        qrContainer.classList.add('show');
    } else {
        // Esconder o container
        qrContainer.classList.add('hidden');
        qrContainer.classList.remove('show');
    }
}

// Exibir mensagem toast
function showToast(message) {
    // Remover toast existente se houver
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        document.body.removeChild(existingToast);
    }
    
    // Criar elemento toast
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    
    // Adicionar ao corpo do documento
    document.body.appendChild(toast);
    
    // Mostrar com animação
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Remover após alguns segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 2500);
}

// Função para adicionar participante
function addParticipant() {
    const name = inputName.value.trim();
    if (name) {
        // Verificar se o nome já existe na lista
        if (participants.some(p => p.name === name)) {
            alert('Este nome já está na lista!');
            return;
        }
        
        participants.push({
            name: name,
            photo: currentPhoto
        });
        
        updateParticipantsList();
        inputName.value = '';
        
        // Resetar a foto
        currentPhoto = null;
        updatePhotoPreview(null);
        
        inputName.focus();
        checkDrawButtonState();
    }
}

// Atualizar lista de participantes
function updateParticipantsList() {
    participantsList.innerHTML = '';
    participants.forEach((participant, index) => {
        const listItem = document.createElement('li');
        
        // Container para informações do participante (foto + nome)
        const participantInfo = document.createElement('div');
        participantInfo.className = 'participant-info';
        
        // Thumbnail
        const thumbnail = document.createElement('div');
        thumbnail.className = 'participant-thumbnail';
        
        if (participant.photo) {
            const img = document.createElement('img');
            img.src = participant.photo;
            img.alt = participant.name;
            thumbnail.appendChild(img);
        }
        
        // Nome
        const nameSpan = document.createElement('span');
        nameSpan.textContent = participant.name;
        nameSpan.className = 'name-item';
        
        // Botão de exclusão
        const deleteButton = document.createElement('img');
        deleteButton.src = 'https://cdn-icons-png.flaticon.com/512/3687/3687412.png';
        deleteButton.className = 'trash-icon';
        deleteButton.alt = 'Remover';
        deleteButton.title = 'Remover participante';
        deleteButton.onclick = function() {
            removeParticipant(index);
        };
        
        // Montar a estrutura
        participantInfo.appendChild(thumbnail);
        participantInfo.appendChild(nameSpan);
        
        listItem.appendChild(participantInfo);
        listItem.appendChild(deleteButton);
        participantsList.appendChild(listItem);
    });
    
    participantsCount.textContent = participants.length;
}

// Remover participante
function removeParticipant(index) {
    participants.splice(index, 1);
    updateParticipantsList();
    checkDrawButtonState();
}

// Verificar estado do botão de sorteio
function checkDrawButtonState() {
    if (participants.length >= 3) {
        drawButton.removeAttribute('disabled');
    } else {
        drawButton.setAttribute('disabled', 'true');
    }
}

// Sortear nomes
function drawNames() {
    if (participants.length < 3) {
        alert('Adicione pelo menos 3 participantes para realizar o sorteio!');
        return;
    }
    
    // Criar cópias dos arrays para não modificar o original
    const givers = [...participants];
    const receivers = [...participants];
    
    // Limpar resultados anteriores
    results = [];
    
    // Algoritmo de sorteio evitando que alguém tire a si mesmo
    let valid = true;
    
    do {
        // Reiniciar a validação
        valid = true;
        
        // Embaralhar a lista de receptores
        shuffle(receivers);
        
        // Verificar se alguém tirou a si mesmo
        for (let i = 0; i < givers.length; i++) {
            if (givers[i].name === receivers[i].name) {
                valid = false;
                break;
            }
        }
    } while (!valid);
    
    // Criar pares de amigo secreto
    for (let i = 0; i < givers.length; i++) {
        results.push({
            giver: givers[i],
            receiver: receivers[i]
        });
    }
    
    // Mostrar resultados
    showResults();
}

// Embaralhar array (algoritmo Fisher-Yates)
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Mostrar resultados
function showResults() {
    // Selecionar um resultado aleatório para mostrar
    const randomIndex = Math.floor(Math.random() * results.length);
    const result = results[randomIndex];
    
    // Salvar o resultado atual para compartilhamento
    currentResult = result;
    
    // Atualizar o modal com o nome do amigo
    friendName.innerHTML = result.receiver.name;
    
    // Atualizar a foto do avatar se existir
    if (result.receiver.photo) {
        avatarImage.innerHTML = `<img src="${result.receiver.photo}" alt="${result.receiver.name}">`;
    } else {
        avatarImage.innerHTML = '';
    }
    
    // Mostrar o modal de resultado
    resultSection.classList.add('show');
    
    // Iniciar a animação de confete
    startConfetti();
    
    // Adicionar animação de fade-in para o nome do amigo
    setTimeout(() => {
        friendName.style.opacity = '0';
        friendName.style.animation = 'none';
        void friendName.offsetWidth; // Forçar reflow
        friendName.style.opacity = '';
        friendName.style.animation = '';
    }, 100);
}

// Fechar modal de resultado
function closeResultModal() {
    resultSection.classList.remove('show');
    stopConfetti();
    
    // Esconder QR code se estiver visível
    if (!qrContainer.classList.contains('hidden')) {
        qrContainer.classList.add('hidden');
        qrContainer.classList.remove('show');
    }
}

// Inicializar a aplicação
window.addEventListener('DOMContentLoaded', init);

// Ajustar o tamanho do canvas quando a janela for redimensionada
window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Animação de Confete
let confettiRunning = false;
let confettiAnimation;

function startConfetti() {
    if (confettiRunning) return;
    confettiRunning = true;
    
    const context = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const particles = [];
    const particleCount = 150;
    const gravity = 0.5;
    
    // Criar partículas
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width, // x-coordenada
            y: Math.random() * height - height, // y-coordenada (começando acima do canvas)
            radius: Math.random() * 5 + 5, // tamanho
            density: Math.random() * particleCount, // densidade / velocidade
            color: `hsl(${Math.random() * 360}, 90%, 65%)`, // cor
            rotation: Math.random() * 360, // rotação
            velocity: { x: Math.random() * 6 - 3, y: Math.random() * 2 + 2 } // velocidade
        });
    }
    
    // Função de animação
    function draw() {
        context.clearRect(0, 0, width, height);
        
        for (let i = 0; i < particleCount; i++) {
            const p = particles[i];
            context.save();
            context.translate(p.x, p.y);
            context.rotate(p.rotation * Math.PI / 180);
            context.fillStyle = p.color;
            context.beginPath();
            
            // Desenhar formas aleatórias (círculos, quadrados, etc.)
            const shapeType = i % 3;
            
            if (shapeType === 0) {
                // Círculo
                context.arc(0, 0, p.radius, 0, Math.PI * 2, true);
            } else if (shapeType === 1) {
                // Quadrado
                context.rect(-p.radius, -p.radius, p.radius * 2, p.radius * 2);
            } else {
                // Estrela
                for (let j = 0; j < 5; j++) {
                    context.lineTo(
                        Math.cos((j * 4 / 5 + 0.5) * Math.PI * 2) * p.radius,
                        Math.sin((j * 4 / 5 + 0.5) * Math.PI * 2) * p.radius
                    );
                    context.lineTo(
                        Math.cos((j * 4 / 5 + 0.7) * Math.PI * 2) * (p.radius / 2),
                        Math.sin((j * 4 / 5 + 0.7) * Math.PI * 2) * (p.radius / 2)
                    );
                }
            }
            
            context.fill();
            context.restore();
            
            // Mover partículas
            p.x += p.velocity.x;
            p.y += p.velocity.y;
            p.velocity.y += gravity;
            
            // Se a partícula sair do canvas, reiniciá-la
            if (p.y > height) {
                particles[i] = {
                    x: Math.random() * width,
                    y: -20,
                    radius: p.radius,
                    density: p.density,
                    color: p.color,
                    rotation: Math.random() * 360,
                    velocity: { x: Math.random() * 6 - 3, y: Math.random() * 2 + 2 }
                };
            }
        }
        
        if (confettiRunning) {
            confettiAnimation = requestAnimationFrame(draw);
        }
    }
    
    // Iniciar animação
    draw();
}

function stopConfetti() {
    confettiRunning = false;
    cancelAnimationFrame(confettiAnimation);
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
}

// THREE.js para efeitos de fundo (neve e decorações)
let scene, camera, renderer, stars = [];

function initThreeJS() {
    // Configurar a cena
    scene = new THREE.Scene();
    
    // Configurar a câmera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 20;
    
    // Configurar o renderizador
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // fundo transparente
    
    // Adicionar o renderizador ao container
    document.querySelector('.canvas-container').appendChild(renderer.domElement);
    
    // Adicionar neve
    addSnow();
    
    // Iniciar a animação
    animate();
    
    // Redimensionar quando a janela for redimensionada
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function addSnow() {
    // Geometria para as partículas de neve
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    
    // Criar 1000 partículas de neve aleatórias
    for (let i = 0; i < 1000; i++) {
        // Posicionar partículas aleatoriamente no espaço
        const x = (Math.random() - 0.5) * 100;
        const y = (Math.random() - 0.5) * 100;
        const z = (Math.random() - 0.5) * 100;
        
        vertices.push(x, y, z);
    }
    
    // Adicionar os vértices à geometria
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    
    // Material para as partículas de neve
    const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.2,
        transparent: true,
        opacity: 0.8,
        map: createSnowTexture(),
    });
    
    // Criar as partículas
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    
    // Salvar para animação
    stars.push(particles);
}

function createSnowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    
    const context = canvas.getContext('2d');
    
    // Criar um gradiente radial para a partícula de neve
    const gradient = context.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
    );
    
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    
    return texture;
}

function animate() {
    requestAnimationFrame(animate);
    
    // Animar a neve
    for (let i = 0; i < stars.length; i++) {
        const positions = stars[i].geometry.attributes.position.array;
        
        for (let j = 0; j < positions.length; j += 3) {
            // Mover a neve para baixo e um pouco para os lados
            positions[j + 1] -= 0.05; // Velocidade vertical
            positions[j] += Math.sin(Date.now() * 0.001 + j) * 0.01; // Movimento lateral suave
            
            // Se a partícula saiu da tela, reposicioná-la
            if (positions[j + 1] < -50) {
                positions[j + 1] = 50;
            }
        }
        
        stars[i].geometry.attributes.position.needsUpdate = true;
        stars[i].rotation.y += 0.0005;
    }
    
    renderer.render(scene, camera);
}

// Criar estrelas decorativas
function createStars() {
    const container = document.querySelector('.main-content');
    
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        
        // Posicionar aleatoriamente dentro do container
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        
        // Atrasar a animação para criar efeito
        star.style.animationDelay = (Math.random() * 5) + 's';
        
        container.appendChild(star);
    }
}