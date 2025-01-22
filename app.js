let amigos = [];
let reconhecimentoDeFala;
// Função para ler texto em voz alta
function lerTextoEmVoz(texto) {
    const synth = window.speechSynthesis;

    // Verifica se a síntese de fala é suportada
    if (!synth) {
        alert('Seu navegador não suporta síntese de fala.');
        return;
    }

    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.voice = synth.getVoices().find(voice => voice.lang === 'pt-BR'); // Voz em português
    utterance.rate = 1.5; // Velocidade normal da fala

    // Fala o texto
    synth.speak(utterance);
}

function adicionarAmigo() {
    const input = document.getElementById('amigo');
    const nome = input.value.trim();

    if (nome === '') {
        alert('Por favor, insira um nome:');
        return;
    }

    const nomeValido = /^[A-Za-z\s]+$/;

    if (!nomeValido.test(nome)) {
        alert('Nome inválido! Apenas letras e espaços são permitidos.');
        return;
    }

    if (amigos.some(amigo => amigo.toLowerCase() === nome.toLowerCase())) {
        alert('Esse nome já foi adicionado!');
        return;
    }

    amigos.push(nome);
    input.value = '';
    atualizarLista();
}

function atualizarLista() {
    const lista = document.getElementById('listaAmigos');
    lista.innerHTML = '';

    if (!Array.isArray(amigos) || amigos.length === 0) {
        return;
    }

    amigos.forEach(function (amigo) {
        const item = document.createElement('li');
        const removerBtn = document.createElement('button');
        removerBtn.textContent = 'Remover';
        removerBtn.onclick = function () {
            removerAmigo(amigo);
        };
        item.textContent = amigo;
        item.appendChild(removerBtn);
        lista.appendChild(item);
    });
}

function removerAmigo(nome) {
    amigos = amigos.filter(amigo => amigo !== nome);
    atualizarLista();
}

function sortearAmigo() {
    const resultado = document.getElementById('resultado');

    if (amigos.length < 5) {
        if (resultado) {
            resultado.innerHTML = 'É necessário ter pelo menos 5 participantes para realizar o sorteio.';
            resultado.style.color = 'red';
        }
        console.log('Número insuficiente de participantes:', amigos.length);
        return;
    }

    const indiceSorteado = Math.floor(Math.random() * amigos.length);
    const amigoSorteado = amigos[indiceSorteado];
    console.log('Índice sorteado:', indiceSorteado, 'Nome sorteado:', amigoSorteado);

    if (resultado) {
        resultado.innerHTML = 'O amigo sorteado foi: ' + amigoSorteado;
        resultado.style.color = 'green';
    }
    lerTextoEmVoz('O amigo sorteado foi ' + amigoSorteado);
}

function novoSorteio() {
    amigos = [];
    atualizarLista();
    const resultado = document.getElementById('resultado');
    if (resultado) {
        resultado.innerHTML = '';
    }
}
