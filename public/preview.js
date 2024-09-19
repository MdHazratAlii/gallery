document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        document.body.innerHTML = '<h1>No ID provided</h1>';
        return;
    }

    fetch(`/preview/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data) {
                const previewImage = document.getElementById('preview-image');
                const previewTitle = document.getElementById('preview-title');
                const previewDescription = document.getElementById('preview-description');

                previewImage.src = data.imageUrl;
                previewTitle.textContent = data.title;
                previewDescription.textContent = data.description;

                // Fetch related wallpapers by category
                fetch(`/wallpapers?search=&category=${encodeURIComponent(data.category)}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(relatedData => {
                        const relatedGallery = document.getElementById('related-gallery');
                        relatedGallery.innerHTML = '';

                        relatedData.forEach(wallpaper => {
                            if (wallpaper._id !== data._id) { // Avoid showing the current wallpaper again
                                const card = document.createElement('div');
                                card.classList.add('related-card');
                                card.dataset.id = wallpaper._id; // Add data-id attribute for identifying the wallpaper

                                const img = document.createElement('img');
                                img.src = wallpaper.imageUrl;
                                img.alt = wallpaper.title;

                                const title = document.createElement('h3');
                                title.textContent = wallpaper.title.length > 20 ? wallpaper.title.substring(0, 20) + '...' : wallpaper.title;

                                const category = document.createElement('p');
                                category.textContent = `Category: ${wallpaper.category}`;

                                card.appendChild(img);
                                card.appendChild(title);
                                card.appendChild(category);

                                // Add click event to card
                                card.addEventListener('click', () => {
                                    // Update preview section with the clicked wallpaper
                                    previewImage.src = wallpaper.imageUrl;
                                    previewTitle.textContent = wallpaper.title;
                                    previewDescription.textContent = wallpaper.description;
                                });

                                relatedGallery.appendChild(card);
                            }
                        });
                    })
                    .catch(error => {
                        console.error('Error fetching related wallpapers:', error);
                    });
            } else {
                document.body.innerHTML = '<h1>Wallpaper not found</h1>';
            }
        })
        .catch(error => {
            console.error('Error fetching wallpaper:', error);
            document.body.innerHTML = '<h1>Error fetching wallpaper</h1>';
        });
});

// OK CODE 