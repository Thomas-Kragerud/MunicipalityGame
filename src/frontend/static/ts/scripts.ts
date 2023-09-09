document.addEventListener('DOMContentLoaded', () => {
    // const map = L.map('map').setView([60.4720, 8.4689], 5);
    //
    // // Displaying the map
    // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    const map = L.map('map-id', { layers: [osmLayer] }).setView([60.4720, 8.4689], 7);

    // Use an event listener to adjust the map size after it's loaded
    map.whenReady(() => {
        map.invalidateSize();
    });

    // Overlaying the GeoJSON data
    fetch('/geojson')
        .then(response => response.json())
        .then(data => {
            const geojsonLayer = L.geoJSON(data, {
                style: {
                    color: '#000', // Black color for the boundary
                    weight: 2,     // Width of the boundary
                    fillOpacity: 0.2 // Transparency of the municipality fill
                },
                onEachFeature: (feature, layer) => {
                    if (feature.properties && feature.properties.navn) {
                        layer.on('click', (e) => {
                            const infoBox = document.getElementById('info-box') as HTMLElement;
                            infoBox.innerHTML = `Du trykket på ${feature.properties.navn}`;
                        });
                    }
                }
            }).addTo(map);
        });
});

