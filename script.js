const difficultyButtons = document.querySelectorAll('.difficulty-btn');
const loserMessage = document.getElementById('loserMessage');
const body = document.body;
const characters = document.querySelectorAll('#characters img');
const customImageInput = document.getElementById('customImage');
const customImageContainer = document.getElementById('customImageContainer');
const startGameButton = document.querySelector('#playerForm button[type="submit"]');
const playerNameInput = document.getElementById('playerName');
const menu = document.getElementById('menu');
const game = document.getElementById('game');
const counter = document.getElementById('counter');
const target = document.getElementById('target');

let clickCount = 0;
let selectedCharacter = '';
let targetSize = 150;
let moveInterval = 2000;
let intervalID;
let lsdInterval;
let currentColorMode = 'normal';

// Configuração inicial
function initGame() {
    menu.style.display = 'none';
    game.style.display = 'block';
    counter.textContent = 'Cliques: 0';
    startTargetMovement();
}

// Iniciar jogo ao enviar formulário
startGameButton.addEventListener('click', (e) => {
    e.preventDefault();

    // Validar entrada do nome
    if (playerNameInput.value.trim() === '') {
        alert('Por favor, insira seu nome.');
        return;
    }

    // Verificar se uma imagem foi selecionada
    if (!selectedCharacter) {
        alert('Por favor, escolha um personagem.');
        return;
    }

    // Configurar imagem do alvo
    target.src = selectedCharacter;
    target.style.width = `${targetSize}px`;
    target.style.height = `${targetSize}px`;

    initGame();
});

// Selecionar personagem
characters.forEach((character) => {
    character.addEventListener('click', () => {
        characters.forEach((char) => char.classList.remove('selected'));
        character.classList.add('selected');
        selectedCharacter = character.src;
    });
});

// Adicionar imagem personalizada
customImageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            const newImg = document.createElement('img');
            newImg.src = reader.result;
            newImg.alt = 'Custom Character';
            newImg.classList.add('selected');
            selectedCharacter = reader.result;

            // Substituir o container
            customImageContainer.innerHTML = '';
            customImageContainer.appendChild(newImg);
        };
        reader.readAsDataURL(file);
    }
});

// Configurar dificuldade
difficultyButtons.forEach((button) => {
    button.addEventListener('click', () => {
        difficultyButtons.forEach((btn) => btn.classList.remove('selected'));
        button.classList.add('selected');
        const difficulty = button.dataset.difficulty;

        const difficultySettings = {
            easy: { size: 200, interval: 2500, colorMode: 'red' },
            medium: { size: 150, interval: 1500, colorMode: 'blue' },
            hard: { size: 100, interval: 800, colorMode: 'green' },
            lsd: { size: 150, interval: 800, colorMode: 'lsd' },
        };

        targetSize = difficultySettings[difficulty].size;
        moveInterval = difficultySettings[difficulty].interval;

        // Configura a cor de fundo de acordo com a dificuldade
        if (difficulty !== 'lsd') {
            currentColorMode = difficultySettings[difficulty].colorMode;
        } else {
            startLSDMode();
        }

        if (difficulty === 'easy') {
            loserMessage.style.display = 'block';
        } else {
            loserMessage.style.display = 'none';
        }
    });
});

// LSD Mode
function startLSDMode() {
    stopLSDMode();
    lsdInterval = setInterval(() => {
        body.style.backgroundColor = `rgb(${randomColor()}, ${randomColor()}, ${randomColor()})`;
    }, 200);
}

function stopLSDMode() {
    clearInterval(lsdInterval);
    body.style.backgroundColor = '#222';
}

// Função para gerar números aleatórios para a cor
function randomColor() {
    return Math.floor(Math.random() * 256);
}

// Mudar cor de fundo de acordo com a dificuldade e clique
function changeBackgroundColor() {
    if (currentColorMode === 'red') {
        body.style.backgroundColor = 'rgb(255, 100, 100)';
    } else if (currentColorMode === 'blue') {
        body.style.backgroundColor = 'rgb(100, 100, 255)';
    } else if (currentColorMode === 'green') {
        body.style.backgroundColor = 'rgb(100, 255, 100)';
    }
}

// Mover o alvo
function startTargetMovement() {
    clearInterval(intervalID);
    moveTarget();
    intervalID = setInterval(moveTarget, moveInterval);
}

function moveTarget() {
    const x = Math.random() * (window.innerWidth - targetSize);
    const y = Math.random() * (window.innerHeight - targetSize);

    target.style.left = `${x}px`;
    target.style.top = `${y}px`;
    target.style.width = `${targetSize}px`;
    target.style.height = `${targetSize}px`;
}

// Evento de clique no alvo
target.addEventListener('click', () => {
    clickCount++;
    counter.textContent = `Cliques: ${clickCount}`;
    moveTarget();
    if (currentColorMode !== 'lsd') {
        changeBackgroundColor(); // Mudar cor a cada clique, exceto no LSD
    }
});
