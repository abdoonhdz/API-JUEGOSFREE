const url = 'https://free-to-play-games-database.p.rapidapi.com/api/games';
const options = {
    method: 'GET',
    headers: {
        'X-RapidAPI-Key': 'd4e3ea9fbbmsha2711ff83e01d6ap17a7cdjsn57cbf247bca3',
        'X-RapidAPI-Host': 'free-to-play-games-database.p.rapidapi.com'
    }
};
let data;
let db;

function abrirBaseDeDatos() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('juegosFavoritos', 1);

        request.onerror = function (event) {
            reject(`Error al abrir la base de datos: ${event.target.errorCode}`);
        };

        request.onsuccess = function (event) {
            db = event.target.result;
            resolve('Base de datos abierta correctamente');
        };

        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            const objectStore = db.createObjectStore('favoritos', {
                keyPath: 'id',
                autoIncrement: true
            });
            objectStore.createIndex('title', 'title', {
                unique: true
            });

            resolve('Base de datos creada correctamente');
        };
    });
}

async function agregarAFavoritos(game) {
    const transaction = db.transaction('favoritos', 'readwrite');
    const objectStore = transaction.objectStore('favoritos');

    const request = objectStore.add(game);

    request.onerror = function (event) {
        console.error(`Error al agregar el juego a favoritos: ${event.target.errorCode}`);
    };

    request.onsuccess = function (event) {
        console.log('Juego agregado a favoritos correctamente');
    };
}

document.addEventListener('click', function (event) {
    if (event.target.classList.contains('enlace')) {
        const card = event.target.closest('.card');
        const title = card.querySelector('.card-title').textContent;

        const game = data.find(game => game.title === title);
        if (game) {
            agregarAFavoritos(game);
        }
    }
});

async function obtenerJSON() {
    try {
        const response = await fetch(url, options);
        data = await response.json();
        mostrarCartas(data);
        llenarSelectGeneros(data);
        await abrirBaseDeDatos();
    } catch (error) {
        console.error(error);
    }
}

function mostrarCartas(data) {
    const cartasContainer = document.getElementById('cartas-container');
    cartasContainer.innerHTML = '';

    data.forEach(game => {
        const cartaHTML = `
            <div class="col-md-4" id="cartas">
                <div class="card my-4">
                    <img src="${game.thumbnail}" class="card-img-top" alt="${game.title}">
                    <div class="card-body">
                        <h3 class="card-title">${game.title}</h3>
                        <p class="parrafo">Plataforma: ${game.platform}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <a href="${game.game_url}" class="btn btn-dark" target="_blank">Ver detalles</a>
                            <p class="btn enlace" id="favorito">⭐</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        cartasContainer.innerHTML += cartaHTML;
    });
}

function llenarSelectGeneros(data) {
    const genreSelect = document.getElementById('genreSelect');
    const genres = obtenerGenerosUnicos(data);

    genres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        genreSelect.appendChild(option);
    });
}

function obtenerGenerosUnicos(data) {
    const genres = new Set();
    data.forEach(game => {
        if (game.genre) {
            genres.add(game.genre);
        }
    });
    return Array.from(genres);
}

function filtrarPorGenero() {
    const genreSelect = document.getElementById('genreSelect');
    const selectedGenre = genreSelect.value;

    const cartasContainer = document.getElementById('cartas-container');
    cartasContainer.innerHTML = '';

    if (selectedGenre === '') {
        mostrarCartas(data);
    } else {
        const juegosFiltrados = data.filter(game => game.genre === selectedGenre);
        mostrarCartas(juegosFiltrados);
    }
}

function filtrarPorBusqueda() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase();

    const cartasContainer = document.getElementById('cartas-container');
    cartasContainer.innerHTML = '';

    if (searchTerm === '') {
        mostrarCartas(data);
    } else {
        const juegosFiltrados = data.filter(game => game.title.toLowerCase().includes(searchTerm));
        mostrarCartas(juegosFiltrados);
    }
}

obtenerJSON();