const dog = document.getElementById('dog');
const counter = document.getElementById('counter');
const toggleMode = document.getElementById('toggleMode');

let clickCount = 0;
let currentSize = 200;

// Lista de sons de cachorro
const dogSounds = [
    'https://cdn.pixabay.com/download/audio/2021/09/20/audio_3f1b1c3b3e.mp3?filename=dog-barking-1.mp3',
    'https://cdn.pixabay.com/download/audio/2022/02/03/audio_36764a74b8.mp3?filename=dog-barking-sound.mp3',
    'https://cdn.pixabay.com/download/audio/2022/01/06/audio_68fc52b1e2.mp3?filename=small-dog-barking.mp3'
];

// Lista de imagens de cachorros latindo
const dogImages = [
    'https://cdn.pixabay.com/photo/2016/02/19/10/00/dog-1209129_960_720.jpg',
    'https://cdn.pixabay.com/photo/2015/03/26/09/43/dog-690239_960_720.jpg',
    'https://cdn.pixabay.com/photo/2017/09/25/13/12/dog-2785074_960_720.jpg',
    'https://cdn.pixabay.com/photo/2016/11/29/12/54/dog-1868710_960_720.jpg',
    'https://cdn.pixabay.com/photo/2017/12/10/14/47/dog-3012514_960_720.jpg'
];

// Gerar uma cor aleatória
const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

// Gerar uma posição aleatória
const getRandomPosition = () => {
    const x = Math.random() * (window.innerWidth - currentSize);
    const y = Math.random() * (window.innerHeight - currentSize);
    return { x, y };
};

// Criar partículas
const createParticle = (x, y) => {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    document.body.appendChild(particle);

    setTimeout(() => particle.remove(), 1000);
};

// Alternar modo noturno/diurno
toggleMode.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    toggleMode.innerHTML = document.body.classList.contains('dark-mode') ? 'Modo Diurno' : 'Modo Noturno';
});

// Adicionar interatividade ao clique no cachorro
dog.addEventListener('click', () => {
    // Incrementar contador de cliques
    clickCount++;
    counter.innerHTML = `Cliques: ${clickCount}`;

    // Mudar cor de fundo
    document.body.style.backgroundColor = getRandomColor();

    // Escolher som aleatório e tocar
    const randomSound = dogSounds[Math.floor(Math.random() * dogSounds.length)];
    const audio = new Audio(randomSound);
    audio.play();

    // Alterar imagem
    const randomImage = dogImages[Math.floor(Math.random() * dogImages.length)];
    dog.src = randomImage;

    // Mover para posição aleatória
    const { x, y } = getRandomPosition();
    dog.style.left = `${x}px`;
    dog.style.top = `${y}px`;

    // Aumentar tamanho da imagem
    currentSize += 10;
    dog.style.width = `${currentSize}px`;

    // Criar partículas
    createParticle(x + currentSize / 2, y + currentSize / 2);
});
