let amigos = [];

// Função para ler texto em voz usando a API de síntese de fala
function lerTextoEmVoz(texto) {
    const synth = window.speechSynthesis;

    if (!synth) {
        console.error('Seu navegador não suporta síntese de fala.');
        return;
    }

    // Cancela qualquer fala anterior
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(texto);
    
    // Tenta encontrar uma voz em português
    utterance.voice = synth.getVoices().find(voice => 
        voice.lang === 'pt-BR' || voice.lang === 'pt' || voice.lang.startsWith('pt')
    ) || null;
    
    utterance.lang = 'pt-BR';
    utterance.rate = 1; // Velocidade normal
    utterance.pitch = 1; // Tom normal

    synth.speak(utterance);
}

// Adiciona um ouvinte para garantir que as vozes sejam carregadas
window.speechSynthesis.onvoiceschanged = () => {
    console.log('Vozes carregadas:', window.speechSynthesis.getVoices().length);
};

// Função para adicionar um novo amigo à lista
function adicionarAmigo() {
    const input = document.getElementById('amigo');
    const nome = input.value.trim();
    const resultado = document.getElementById('resultado');

    // Limpa qualquer mensagem anterior
    if (resultado) {
        resultado.innerHTML = '';
        resultado.className = 'result-list';
    }

    // Validações
    if (nome === '') {
        exibirMensagem('Por favor, insira um nome.', 'error');
        return;
    }

    const nomeValido = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
    if (!nomeValido.test(nome)) {
        exibirMensagem('Nome inválido! Apenas letras e espaços são permitidos.', 'error');
        return;
    }

    if (nome.length < 3) {
        exibirMensagem('O nome deve conter pelo menos 3 caracteres.', 'error');
        return;
    }

    if (amigos.some(amigo => amigo.toLowerCase() === nome.toLowerCase())) {
        exibirMensagem('Esse nome já foi adicionado!', 'error');
        return;
    }

    // Adiciona o novo amigo à lista
    amigos.push(nome);
    input.value = '';
    
    // Atualiza a lista visual
    atualizarLista();
    
    // Foca novamente no input para adicionar outro nome
    input.focus();
}

// Exibe mensagens de feedback
function exibirMensagem(texto, tipo) {
    const resultado = document.getElementById('resultado');
    if (!resultado) return;
    
    resultado.innerHTML = texto;
    resultado.className = `result-list ${tipo}`;
    
    // Lê a mensagem para acessibilidade
    lerTextoEmVoz(texto);
    
    // Remove a mensagem após alguns segundos
    if (tipo === 'error') {
        setTimeout(() => {
            resultado.innerHTML = '';
            resultado.className = 'result-list';
        }, 5000);
    }
}

// Atualiza a lista visual de amigos
function atualizarLista() {
    const lista = document.getElementById('listaAmigos');
    lista.innerHTML = '';

    if (!amigos.length) {
        lista.innerHTML = '<li class="empty-list">Nenhum participante adicionado</li>';
        return;
    }

    const fragment = document.createDocumentFragment();

    amigos.forEach(function (amigo) {
        const item = document.createElement('li');
        
        const texto = document.createElement('span');
        texto.textContent = amigo;
        texto.className = 'name-item';

        const lixeiraImg = document.createElement('img');
        lixeiraImg.src = 'assets/trash.png';
        lixeiraImg.alt = `Remover ${amigo}`;
        lixeiraImg.className = 'trash-icon';
        lixeiraImg.setAttribute('tabindex', '0'); // Torna o ícone focável
        
        // Adiciona eventos de mouse e teclado para acessibilidade
        lixeiraImg.onclick = () => removerAmigo(amigo);
        lixeiraImg.onkeydown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                removerAmigo(amigo);
                e.preventDefault();
            }
        };

        item.appendChild(texto);
        item.appendChild(lixeiraImg);
        fragment.appendChild(item);
    });

    lista.appendChild(fragment);
}

// Remove um amigo da lista
function removerAmigo(nome) {
    amigos = amigos.filter(amigo => amigo !== nome);
    atualizarLista();
}

// Realiza o sorteio do amigo secreto
function sortearAmigo() {
    if (amigos.length < 5) {
        const mensagem = 'É necessário ter pelo menos 5 participantes para realizar o sorteio.';
        exibirMensagem(mensagem, 'error');
        return;
    }

    // Efeito visual de sorteio
    const resultado = document.getElementById('resultado');
    
    // Animação de sorteio
    resultado.innerHTML = 'Sorteando...';
    resultado.className = 'result-list';
    
    // Simula um sorteio com animação
    const nomes = [...amigos];
    let contador = 0;
    const intervalo = setInterval(() => {
        const indiceAleatorio = Math.floor(Math.random() * nomes.length);
        resultado.innerHTML = `Sorteando... ${nomes[indiceAleatorio]}`;
        contador++;
        
        if (contador > 8) {
            clearInterval(intervalo);
            // Sorteia efetivamente
            const indiceSorteado = Math.floor(Math.random() * amigos.length);
            const amigoSorteado = amigos[indiceSorteado];
            
            // Mostra o resultado final
            const mensagemFinal = `O amigo sorteado foi: ${amigoSorteado}`;
            resultado.innerHTML = mensagemFinal;
            resultado.className = 'result-list success';
            
            // Lê o resultado em voz alta
            lerTextoEmVoz(mensagemFinal);
        }
    }, 200);
}

// Adiciona manipulador de eventos para o Enter no input
document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('amigo');
    if (input) {
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                adicionarAmigo();
                e.preventDefault();
            }
        });
    }
    
    // Inicializa a lista
    atualizarLista();
});