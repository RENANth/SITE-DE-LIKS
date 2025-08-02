// =====================
// Variáveis Globais
// =====================
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
let ranking = [];
let unlockedCharacters = ['dog', 'dog2'];
let comboCount = 0;
let lastClickTime = 0;
let comboTimeout;
let achievements = [];
let playerAvatar = '';
let timer = 30;
let timerInterval;

// =====================
// Utilitários de Áudio
// =====================
const barkSounds = [
    new Audio('https://cdn.pixabay.com/audio/2022/07/26/audio_124bfae2e2.mp3'),
    new Audio('https://cdn.pixabay.com/audio/2022/07/26/audio_124bfae2e2.mp3'),
    new Audio('https://cdn.pixabay.com/audio/2022/07/26/audio_124bfae2e2.mp3')
];
const meowSound = new Audio('https://cdn.pixabay.com/audio/2022/07/26/audio_124bfae2e2.mp3');

function playBark() {
    if (selectedCharacter && selectedCharacter.includes('cat')) {
        meowSound.currentTime = 0;
        meowSound.play();
    } else {
        const sound = barkSounds[Math.floor(Math.random() * barkSounds.length)];
        sound.currentTime = 0;
        sound.play();
    }
}

// =====================
// Funções de UI
// =====================
function createOrGetElement(id, tag = 'div', styles = {}) {
    let el = document.getElementById(id);
    if (!el) {
        el = document.createElement(tag);
        el.id = id;
        Object.assign(el.style, styles);
        document.body.appendChild(el);
    }
    return el;
}

function showTimer() {
    const timerDiv = createOrGetElement('timerDiv', 'div', {
        position: 'fixed', top: '10px', right: '10px', fontSize: '20px',
        background: 'rgba(0,0,0,0.5)', padding: '10px 18px', borderRadius: '8px',
        color: '#fff', zIndex: '9999'
    });
    timerDiv.textContent = `Tempo: ${timer}s`;
}

function showAvatar() {
    const avatarDiv = createOrGetElement('avatarTop', 'div', {
        position: 'fixed', top: '10px', left: '50%', transform: 'translateX(-50%)',
        zIndex: '9999', width: '60px', height: '60px', borderRadius: '50%',
        overflow: 'hidden', boxShadow: '0 2px 8px #7f5af0aa', background: '#181c2b'
    });
    avatarDiv.innerHTML = `<img src='${selectedCharacter}' alt='Avatar' style='width:100%;height:100%;object-fit:cover;border-radius:50%;'>`;
}

function showCombo() {
    const comboDiv = createOrGetElement('comboDiv', 'div', {
        position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)',
        fontSize: '2rem', color: '#eebbc3', fontWeight: 'bold', zIndex: '9999', opacity: 1
    });
    comboDiv.textContent = `Combo x${comboCount}!`;
    comboDiv.style.opacity = 1;
    setTimeout(() => { comboDiv.style.opacity = 0; }, 700);
}

function showParticles(x, y) {
    for (let i = 0; i < 12; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        Object.assign(p.style, {
            position: 'fixed', left: x + 'px', top: y + 'px', width: '8px', height: '8px',
            borderRadius: '50%', background: `hsl(${Math.random() * 360},100%,70%)`,
            pointerEvents: 'none', zIndex: '9999', transform: 'translate(-50%,-50%)'
        });
        document.body.appendChild(p);
        setTimeout(() => {
            p.style.transition = 'all 0.7s cubic-bezier(.17,.67,.83,.67)';
            p.style.left = (x + Math.random() * 120 - 60) + 'px';
            p.style.top = (y + Math.random() * 120 - 60) + 'px';
            p.style.opacity = 0;
        }, 10);
        setTimeout(() => p.remove(), 800);
    }
}

function showAchievement(list) {
    const achDiv = createOrGetElement('achDiv', 'div', {
        position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
        background: '#232946ee', color: '#eebbc3', padding: '12px 24px', borderRadius: '12px',
        fontWeight: 'bold', zIndex: '9999', fontSize: '1.1rem', boxShadow: '0 0 24px #7f5af0cc', opacity: 1
    });
    achDiv.textContent = 'Conquista: ' + list.map(a => {
        if (a === '10cliques') return '10 Cliques! 🥉';
        if (a === '50cliques') return '50 Cliques! 🥈';
        if (a === '100cliques') return '100 Cliques! 🥇';
        if (a === 'combo5') return 'Combo x5! 💥';
        return a;
    }).join(', ');
    const audio = new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_115b9b6e7b.mp3');
    audio.play();
    setTimeout(() => { achDiv.style.opacity = 0; }, 2200);
}

function showCountdown(callback) {
    const countdownDiv = createOrGetElement('countdownDiv', 'div', {
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        fontSize: '4rem', color: '#eebbc3', fontWeight: 'bold', zIndex: '99999',
        background: 'rgba(24,28,43,0.85)', padding: '40px 60px', borderRadius: '24px', textAlign: 'center'
    });
    let count = 3;
    countdownDiv.textContent = count;
    let interval = setInterval(() => {
        count--;
        if (count > 0) {
            countdownDiv.textContent = count;
        } else if (count === 0) {
            countdownDiv.textContent = 'Já!';
        } else {
            clearInterval(interval);
            countdownDiv.remove();
            if (callback) callback();
        }
    }, 800);
}

// =====================
// Funções de Lógica do Jogo
// =====================
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

function randomColor() {
    return Math.floor(Math.random() * 256);
}

function changeBackgroundColor() {
    const colors = {
        red: 'rgb(255, 100, 100)',
        blue: 'rgb(100, 100, 255)',
        green: 'rgb(100, 255, 100)'
    };
    if (currentColorMode in colors) {
        body.style.backgroundColor = colors[currentColorMode];
    }
}

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

function startTimer() {
    timer = 30;
    showTimer();
    timerInterval = setInterval(() => {
        timer--;
        showTimer();
        if (timer <= 0) {
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000);
}

function checkAchievements() {
    let unlocked = [];
    if (clickCount >= 10 && !achievements.includes('10cliques')) unlocked.push('10cliques');
    if (clickCount >= 50 && !achievements.includes('50cliques')) unlocked.push('50cliques');
    if (clickCount >= 100 && !achievements.includes('100cliques')) unlocked.push('100cliques');
    if (comboCount >= 5 && !achievements.includes('combo5')) unlocked.push('combo5');
    if (unlocked.length) {
        achievements = achievements.concat(unlocked);
        showAchievement(unlocked);
    }
}

function removeGameUIElements(removeEndScreen = true) {
    const ids = ['clickCounterDiv', 'timerDiv', 'avatarTop', 'comboDiv', 'achDiv', 'globalRanking', 'countdownDiv'];
    if (removeEndScreen) ids.push('endScreen');
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
    });
    clearInterval(timerInterval);
}

function showEndScreen() {
    removeGameUIElements(false);
    const endScreen = createOrGetElement('endScreen', 'div', {
        position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
        background: 'rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', zIndex: '9999'
    });
    endScreen.innerHTML = `<h2 style='color:#eebbc3;font-size:2.2rem;margin-bottom:10px;'>Fim de Jogo!</h2><p style='color:#fff;font-size:1.2rem;'>Você fez ${clickCount} cliques!</p><button id='restartBtn' style='margin-top:18px;font-size:1.2rem;padding:12px 32px;background:linear-gradient(90deg,#7f5af0,#2cb67d);color:#fff;border:none;border-radius:12px;box-shadow:0 2px 12px #7f5af055;transition:transform 0.2s;'>Jogar Novamente</button>`;
    const btn = document.getElementById('restartBtn');
    btn.onmouseover = () => { btn.style.transform = 'scale(1.08)'; };
    btn.onmouseout = () => { btn.style.transform = 'scale(1)'; };
    btn.onclick = () => {
        removeGameUIElements();
        menu.style.display = '';
        game.style.display = 'none';
        target.style.display = '';
        game.style.pointerEvents = '';
        clickCount = 0;
        counter.textContent = 'Cliques: 0';
        achievements = [];
        comboCount = 0;
        lastClickTime = 0;
        document.querySelectorAll('#characters img').forEach(img => img.classList.remove('selected'));
        selectedCharacter = '';
        difficultyButtons.forEach(btn => btn.classList.remove('selected'));
        playerNameInput.value = '';
        clearInterval(intervalID);
        if (lsdInterval) clearInterval(lsdInterval);
    };
    showConfetti();
}

// =====================
// Event Listeners e Inicialização
// =====================
window.addEventListener('DOMContentLoaded', () => {
    removeGameUIElements();
    const zenBtn = document.getElementById('zenBtn');
    if (zenBtn) zenBtn.remove();
});

startGameButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (playerNameInput.value.trim() === '') {
        alert('Por favor, insira seu nome.');
        return;
    }
    if (!selectedCharacter) {
        alert('Por favor, escolha um personagem.');
        return;
    }
    target.src = selectedCharacter;
    target.style.width = `${targetSize}px`;
    target.style.height = `${targetSize}px`;
    showCountdown(() => {
        initGame();
        showAvatar();
        updateGlobalRanking();
    });
});

characters.forEach((character) => {
    character.addEventListener('click', () => {
        characters.forEach((char) => char.classList.remove('selected'));
        character.classList.add('selected');
        selectedCharacter = character.src;
    });
});

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
            customImageContainer.innerHTML = '';
            customImageContainer.appendChild(newImg);
        };
        reader.readAsDataURL(file);
    }
});

difficultyButtons.forEach((button) => {
    button.addEventListener('click', () => {
        difficultyButtons.forEach((btn) => btn.classList.remove('selected'));
        button.classList.add('selected');
        const difficulty = button.dataset.difficulty;
        const difficultySettings = {
            easy: { size: 220, interval: 2200, colorMode: 'red' },
            medium: { size: 140, interval: 1200, colorMode: 'blue' },
            hard: { size: 80, interval: 600, colorMode: 'green' },
            lsd: { size: 120, interval: 400, colorMode: 'lsd' },
        };
        targetSize = difficultySettings[difficulty].size;
        moveInterval = difficultySettings[difficulty].interval;
        if (difficulty !== 'lsd') {
            currentColorMode = difficultySettings[difficulty].colorMode;
            stopLSDMode();
        } else {
            startLSDMode();
        }
        loserMessage.style.display = (difficulty === 'easy') ? 'block' : 'none';
    });
});

target.addEventListener('click', (ev) => {
    clickCount++;
    counter.textContent = `Cliques: ${clickCount}`;
    moveTarget();
    playBark();
    if (currentColorMode !== 'lsd') {
        changeBackgroundColor();
    }
    showParticles(ev.clientX, ev.clientY);
    const now = Date.now();
    if (now - lastClickTime < 500) {
        comboCount++;
        showCombo();
    } else {
        comboCount = 1;
    }
    lastClickTime = now;
    clearTimeout(comboTimeout);
    comboTimeout = setTimeout(() => comboCount = 0, 1000);
    checkAchievements();
    if (clickCount === 20 && !unlockedCharacters.includes('dog3')) {
        unlockCharacter('dog3');
    }
    animateTarget();
});

function unlockCharacter(char) {
    unlockedCharacters.push(char);
    const img = document.createElement('img');
    img.src = 'https://cdn.pixabay.com/photo/2017/09/25/13/12/dog-2785074_960_720.jpg';
    img.alt = 'Dog 3';
    img.dataset.character = 'dog3';
    document.getElementById('characters').appendChild(img);
}

function animateTarget() {
    target.style.transform = 'scale(1.2)';
    setTimeout(() => target.style.transform = 'scale(1)', 150);
}

function endGame() {
    clearInterval(timerInterval);
    clearInterval(intervalID);
    if (lsdInterval) clearInterval(lsdInterval);
    target.style.display = 'none';
    game.style.pointerEvents = 'none';
    showEndScreen();
    saveScore && saveScore();
    updateRanking && updateRanking();
    updateGlobalRanking && updateGlobalRanking();
}

// =====================
// Inicialização do Jogo
// =====================
function initGame() {
    menu.style.display = 'none';
    game.style.display = 'block';
    counter.textContent = 'Cliques: 0';
    startTargetMovement();
    startTimer();
}

