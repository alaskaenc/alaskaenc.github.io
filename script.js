async function searchImages() {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (!query) {
        resultsDiv.innerHTML = '<p>Por favor, ingresa un término de búsqueda.</p>';
        return;
    }

    const repoOwner = 'alaskaenc';  // Reemplaza con tu usuario de GitHub
    const repoName = 'codigos';  // Reemplaza con el nombre de tu repositorio
    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/git/trees/main?recursive=1`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        // Filtrar los archivos que son imágenes y coinciden con la búsqueda
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
                imgElement.onclick = () => openModal(imgUrl);  // Agregar evento onclick
                resultsDiv.appendChild(imgElement);
            });
        } else {
            resultsDiv.innerHTML = '<p>No se encontraron imágenes.</p>';
        }

    } catch (error) {
        console.error('Error fetching files:', error);
        resultsDiv.innerHTML = '<p>Error al buscar imágenes. Por favor, intenta nuevamente.</p>';
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

// Añadir evento para el Enter en el campo de búsqueda
document.getElementById('searchInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Evita el comportamiento por defecto del Enter
        searchImages();
    }
});
