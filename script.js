const repoOwner = 'alaskaenc';
const repoName = 'codigos';
const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/git/trees/main?recursive=1`;
const pricesUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/prices.json`;

async function searchImages() {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (!query) {
        resultsDiv.innerHTML = '<p>Por favor, ingresa un término de búsqueda.</p>';
        return;
    }

    try {
        const [response, pricesResponse] = await Promise.all([
            fetch(apiUrl),
            fetch(pricesUrl)
        ]);

        if (!response.ok || !pricesResponse.ok) throw new Error('No se pudo acceder a los datos.');

        const data = await response.json();
        const prices = await pricesResponse.json();

        const files = data.tree.filter(file =>
            file.path.toLowerCase().includes(query) &&
            /\.(jpg|png|gif)$/i.test(file.path)
        );

        if (files.length === 0) {
            resultsDiv.innerHTML = '<p>No se encontraron imágenes.</p>';
            return;
        }

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
    } catch (error) {
        console.error(error);
        resultsDiv.innerHTML = '<p>Hubo un error al realizar la búsqueda.</p>';
    }
}

async function fetchRecentImages() {
    const recentDiv = document.getElementById('recentImages');
    recentDiv.innerHTML = '';

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('No se pudo cargar las imágenes recientes.');

        const data = await response.json();
        const recentImages = data.tree
            .filter(file => /\.(jpg|png|gif)$/i.test(file.path))
            .slice(-50);

        recentImages.forEach(file => {
            const imgUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${file.path}`;
            const fileName = file.path.split('/').pop();

            const imgElement = document.createElement('img');
            imgElement.src = imgUrl;
            imgElement.alt = fileName;
            imgElement.onclick = () => openModal(imgUrl);

            const nameElement = document.createElement('p');
            nameElement.textContent = fileName;
            nameElement.className = 'file-name';

            const container = document.createElement('div');
            container.className = 'image-container';
            container.appendChild(nameElement);
            container.appendChild(imgElement);

            recentDiv.appendChild(container);
        });
    } catch (error) {
        console.error(error);
        recentDiv.innerHTML = '<p>Error al cargar imágenes recientes.</p>';
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

window.onload = fetchRecentImages;
