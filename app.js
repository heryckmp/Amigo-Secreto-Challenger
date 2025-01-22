//O principal objetivo deste desafio é fortalecer suas habilidades em lógica de programação. Aqui você deverá desenvolver a lógica para resolver o problema.
let amigos = ['mirela', 'lucas', 'Eric', 'Paola'];

function adicionarAmigo() {
    let input = document.getElementById('amigo'); 
    let nome = input.value.trim();  // Remove espaços extras no começo e no final do nome inserido

    
    if (nome == '') {
        alert('Por favor, insira um nome:'); 
        return; // Interrompe a execução da função
    }

    
    amigos.push(nome);

    // Limpa o campo de entrada após adicionar
    input.value = '';

   console.log(amigos); 