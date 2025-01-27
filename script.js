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
