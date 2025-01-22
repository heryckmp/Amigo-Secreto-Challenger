let amigos = [];
let reconhecimentoDeFala;

function lerTextoEmVoz(texto) {
    const synth = window.speechSynthesis;

    if (!synth) {
        alert('Seu navegador não suporta síntese de fala.');
        return;
    }

    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.voice = synth.getVoices().find(voice => voice.lang === 'pt-BR') || null;
    utterance.rate = 1.5;

    if (utterance.voice) {
        synth.speak(utterance);
    } else {
        console.warn('Nenhuma voz compatível encontrada.');
    }
}

function adicionarAmigo() {
    const input = document.getElementById('amigo');
    const nome = input.value.trim();

    if (nome === '') {
        alert('Por favor, insira um nome:');
        return;
    }

    const nomeValido = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;

    if (!nomeValido.test(nome)) {
        alert('Nome inválido! Apenas letras e espaços são permitidos.');
        return;
    }

    
    if (nome.length < 3) {
        alert('O nome deve conter pelo menos 3 caracteres.');
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

    if (!amigos.length) return;

    const fragment = document.createDocumentFragment();

    amigos.forEach(function (amigo) {
        const item = document.createElement('li');
        const texto = document.createElement('span');
        const lixeiraImg = document.createElement('img');

        texto.textContent = amigo;
        texto.className = 'name-item';

        lixeiraImg.src = 'assets/trash.png';
        lixeiraImg.alt = 'Remover';
        lixeiraImg.className = 'trash-icon';
        lixeiraImg.onclick = () => removerAmigo(amigo);

        item.appendChild(texto);
        item.appendChild(lixeiraImg);
        fragment.appendChild(item);
    });

    lista.appendChild(fragment);
}

function removerAmigo(nome) {
    amigos = amigos.filter(amigo => amigo !== nome);
    atualizarLista();
}

function sortearAmigo() {
    const resultado = document.getElementById('resultado');

    if (amigos.length < 5) {
        const mensagem = 'É necessário ter pelo menos 5 participantes para realizar o sorteio.';
        if (resultado) {
            resultado.innerHTML = mensagem;
            resultado.style.color = 'red';
            lerTextoEmVoz(mensagem);

            setTimeout(() => {
                resultado.innerHTML = '';
            }, 7000);
        }
        return;
    }

    const indiceSorteado = Math.floor(Math.random() * amigos.length);
    const amigoSorteado = amigos[indiceSorteado];

    if (resultado) {
        resultado.innerHTML = 'O amigo sorteado foi: ' + amigoSorteado;
        resultado.style.color = 'green';
        lerTextoEmVoz('O amigo sorteado foi ' + amigoSorteado);
    }
}


