async function searchImages() {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (!query) {
        resultsDiv.innerHTML = '<p>Por favor, ingresa un término de búsqueda.</p>';
        return;
    }

    const repoOwner = 'alaskaenc';
    const repoName = 'codigos';
    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/git/trees/main?recursive=1`;
    const pricesUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/prices.json`;

    try {
        // Realizar ambas peticiones simultáneamente
        const [response, pricesResponse] = await Promise.all([
            fetch(apiUrl),
            fetch(pricesUrl)
        ]);

        // Verifica el estado de las respuestas
        if (!response.ok) {
            throw new Error(`Error al acceder a la API: ${response.statusText}`);
        }
        if (!pricesResponse.ok) {
            throw new Error(`Error al acceder al archivo de precios: ${pricesResponse.statusText}`);
        }

        const data = await response.json();
        const prices = await pricesResponse.json();

        console.log('Datos de la API:', data);
        console.log('Precios:', prices);

        const files = data.tree.filter(file =>
            file.path.toLowerCase().includes(query) &&
            (file.path.endsWith('.jpg') || file.path.endsWith('.png') || file.path.endsWith('.gif'))
        );

        if (files.length > 0) {
            files.forEach(file => {
                const imgUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${file.path}`;
                const imgElement = document.createElement('img');
                imgElement.src = imgUrl;
                imgElement.alt = file.path.split('/').pop();
                imgElement.onclick = () => openModal(imgUrl);

                const price = prices[file.path.split('/').pop()] || "Precio no disponible";
                const priceElement = document.createElement('p');
                priceElement.textContent = price;
                priceElement.className = 'price';

                const container = document.createElement('div');
                container.className = 'image-container';
                container.appendChild(imgElement);
                container.appendChild(priceElement);

                resultsDiv.appendChild(container);
            });
        } else {
            resultsDiv.innerHTML = '<p>No se encontraron imágenes.</p>';
        }

    } catch (error) {
        console.error('Error en searchImages:', error);
        resultsDiv.innerHTML = `<p>Error al buscar imágenes. Por favor, intenta nuevamente. Detalles: ${error.message}</p>`;
    }
}

function openModal(imgUrl) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImg');
    modal.style.display = 'block';
    modalImg.src = imgUrl;
}

function closeModal() {
    const modal = document.getElementById('imageModal');
    modal.style.display = 'none';
}

document.getElementById('searchInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        searchImages();
    }
});
