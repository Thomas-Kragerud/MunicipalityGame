// Set up basic map properties
class NorwayMap {
    private map!: L.Map;

    constructor() {
        this.initializeMap();
    }

    private initializeMap() {
        const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });

        this.map = L.map('map-id', {layers: [osmLayer]}).setView([63.8305, 8.4689], 5);
        this.map.whenReady(() => {
            this.map.invalidateSize();
        });
    }

    public addGeoJSONLayer(data: any) {
        L.geoJSON(data, {
            style: {
                color: '#000',
                weight: 2,
                fillOpacity: 0.2
            },
            onEachFeature: (feature, layer) => {
                if (feature.properties && feature.properties.navn) {
                    layer.on('click', (e) => {
                        const municipalityNameElem = document.getElementById('municipality-name') as HTMLElement;
                        municipalityNameElem.innerText = `Du trykket på ${feature.properties.navn}`;
                        // Prevent event propagation
                        e.originalEvent.stopPropagation();
                    });
                }
            }
        }).addTo(this.map);
    }

    public highlightMunicipality(name: string) {
        logToPage("Highlighted: " + name);
        this.map.eachLayer((layer) => {
            if (layer instanceof L.GeoJSON) {
                layer.eachLayer((featureLayer: any) => {
                    if (featureLayer.feature && featureLayer.feature.properties && featureLayer.feature.properties.navn === name) {
                        if (typeof featureLayer.setStyle === 'function') {
                            featureLayer.setStyle({
                                fillColor: 'red',
                                fillOpacity: 0.7
                            });
                        }
                    }
                });
            }
        });
    }

    public resetHighlights() {
        this.map.eachLayer((layer) => {
            if (layer instanceof L.GeoJSON) {
                layer.eachLayer((featureLayer: any) => {
                    if (typeof featureLayer.setStyle === 'function') {
                        featureLayer.setStyle({
                            fillColor: '#000',
                            fillOpacity: 0.2
                        });
                    }
                });
            }
        });
    }
}

function logToPage(message: string) {
    const logElement = document.getElementById('debug-log');
    if (logElement) {
        logElement.innerHTML += `<div>${message}</div>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const norwayMap = new NorwayMap();

    fetch('/geojson')
        .then(response => response.json())
        .then(data => norwayMap.addGeoJSONLayer(data));

    const startGameButton = document.getElementById('start-game-btn');
    startGameButton?.addEventListener('click', () => {
        logToPage("Start Game button clicked!");
        norwayMap.resetHighlights();

        fetch('/get-random-municipality')
            .then(response => response.json())
            .then(data => {
                norwayMap.highlightMunicipality(data.name);
                const iconElem = document.getElementById('municipality-icon') as HTMLImageElement;
                iconElem.src = data.icon_url;
                iconElem.style.display = 'block';
            });
    });
});
