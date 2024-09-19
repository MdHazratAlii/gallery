document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('upload-form');
    const gallery = document.getElementById('gallery');
    const searchInput = document.getElementById('search-input');
    const categoryButtons = document.querySelectorAll('.category-button'); // Match the class in HTML

    if (uploadForm) {
        uploadForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(uploadForm);

            try {
                const response = await fetch('/upload', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Failed to upload wallpaper');
                }

                const result = await response.json();

                if (result) {
                    const card = createWallpaperCard(result);
                    gallery.appendChild(card);
                    uploadForm.reset();
                } else {
                    alert('Upload failed');
                }
            } catch (error) {
                console.error('Error uploading wallpaper:', error);
                alert('Error uploading wallpaper');
            }
        });
    }

    // Fetch wallpapers and display them in the gallery
    async function fetchWallpapers(searchTerm = '', category = '') {
        try {
            const query = new URLSearchParams();
            if (searchTerm) query.append('search', searchTerm);
            if (category) query.append('category', category);

            const response = await fetch(`/wallpapers?${query.toString()}`);
            console.log(response)
            if (!response.ok) {
                throw new Error('Failed to fetch wallpapers');
            }
            const wallpapers = await response.json();
            gallery.innerHTML = ''; // Clear the gallery

            if (wallpapers.length === 0) {
                gallery.innerHTML = '<p>No wallpapers found.</p>';
            }

            wallpapers.forEach(wallpaper => {
                const card = createWallpaperCard(wallpaper);
                gallery.appendChild(card);
            });
        } catch (error) {
            console.error('Error fetching wallpapers:', error);
        }
    }

    function createWallpaperCard(wallpaper) {
        const card = document.createElement('div');
        card.classList.add('wallpaper-card');

        const img = document.createElement('img');
        img.src = wallpaper.imageUrl;
        img.alt = wallpaper.title;

        const title = document.createElement('h3');
        title.textContent = wallpaper.title.length > 20 ? wallpaper.title.substring(0, 20) + '...' : wallpaper.title;

        const description = document.createElement('p');
        description.textContent = wallpaper.description.length > 50 ? wallpaper.description.substring(0, 50) + '...' : wallpaper.description;

        const category = document.createElement('p');
        category.textContent = wallpaper.category || 'No category';
        category.classList.add('category');

        const previewButton = document.createElement('a');
        previewButton.href = `/preview.html?id=${wallpaper._id}`;
        previewButton.textContent = 'Preview';
        previewButton.classList.add('preview-button');

        card.appendChild(img);
        card.appendChild(title);
        card.appendChild(description);
        card.appendChild(category);
        card.appendChild(previewButton);

        return card;
    }

    // Live search event listener
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.trim();
        fetchWallpapers(searchTerm);
    });

    // Category click event listener
    categoryButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const category = event.target.dataset.category; // Get category from data attribute
            fetchWallpapers('', category);
        });
    });

    // Fetch all wallpapers on page load
    fetchWallpapers();
});

// Working Code 