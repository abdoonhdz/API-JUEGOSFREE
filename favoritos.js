document.addEventListener('DOMContentLoaded', async function () {
    const favoritosContainer = document.getElementById('favoritos-container');
    await abrirBaseDeDatos();

    const transaction = db.transaction('favoritos', 'readonly');
    const objectStore = transaction.objectStore('favoritos');

    const cursor = objectStore.openCursor();

    const juegosContainer = document.createElement('div');
    juegosContainer.classList.add('row');

    cursor.onsuccess = function (event) {
        const cursor = event.target.result;

        if (cursor) {
            const juego = cursor.value;

            const nuevoDiv = document.createElement('div');
            nuevoDiv.classList.add('col-md-4');
            nuevoDiv.innerHTML = `
                <div class="card my-4">
                    <img src="${juego.thumbnail}" class="card-img-top" alt="${juego.title}">
                    <div class="card-body">
                        <h3 class="card-title">${juego.title}</h3>
                        <p class="parrafo">Plataforma: ${juego.platform}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <a href="${juego.game_url}" class="btn btn-dark" target="_blank">Ver detalles</a>
                            
                            <!-- Agregar botón "Eliminar" sin evento onclick -->
                            <button class="btn btn-danger" data-id="${juego.id}">Eliminar</button>
                        </div>
                    </div>
                </div>
            `;

            juegosContainer.appendChild(nuevoDiv);

            cursor.continue();
        } else {

            favoritosContainer.appendChild(juegosContainer);

            const botonesEliminar = document.querySelectorAll('.btn-danger');
            botonesEliminar.forEach(boton => {
                boton.addEventListener('click', function () {
                    const id = this.getAttribute('data-id');
                    eliminarJuego(id);
                    this.closest('.col-md-4').remove();
                });
            });
        }
    };
});

function eliminarJuego(id) {
    const transaction = db.transaction('favoritos', 'readwrite');
    const objectStore = transaction.objectStore('favoritos');

    const request = objectStore.delete(Number(id));

}