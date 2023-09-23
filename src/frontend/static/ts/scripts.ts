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
const searchInput = document.getElementById('municipality-search') as HTMLInputElement;
const autocompleteResults = document.getElementById('autocomplete-results') as HTMLDivElement;

let activeItemIndex: number = -1;

searchInput.addEventListener('keydown', function(e) {
    const items = Array.from(autocompleteResults.children);

    if (e.key === "ArrowDown") {
        if (activeItemIndex < items.length - 1) {
            activeItemIndex++;
        }
    } else if (e.key === "ArrowUp") {
        if (activeItemIndex > 0) {
            activeItemIndex--;
        }
    } else if (e.key === "Enter") {
        if (activeItemIndex > -1 && activeItemIndex < items.length) {
            searchInput.value = items[activeItemIndex].innerHTML;
            autocompleteResults.innerHTML = '';
            e.preventDefault(); // Prevent form submission or other default behaviors
        }
    }

    // Highlight the active item
    items.forEach((item, index) => {
        if (index === activeItemIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
});
searchInput.addEventListener('input', function() {
    const query = this.value;
    activeItemIndex = -1;
    if (!query) {
        autocompleteResults.innerHTML = '';
        return;
    }

    // Fetch possible matches from the backend
    fetch(`/search-municipalities?q=${query}`)
        .then(response => response.json())
        .then(data => {
            autocompleteResults.innerHTML = '';
            data.names.forEach((name: string) => {
                const item = document.createElement('div');
                item.innerHTML = name;
                item.addEventListener('click', function() {
                    searchInput.value = this.innerHTML;
                    autocompleteResults.innerHTML = '';
                });
                autocompleteResults.appendChild(item);
            });
        });
});

// Close the dropdown if the user clicks outside of it
document.addEventListener('click', function(event) {
    if (event.target !== searchInput) {
        autocompleteResults.innerHTML = '';
    }
});

const submitButton = document.getElementById('submit-guess');
submitButton?.addEventListener('click', () => {
    const guess = (document.getElementById('municipality-search') as HTMLInputElement).value;
    checkGuess(guess);
})

function checkGuess(guess: string) {
    fetch('/check-guess', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({guess: guess})
    })
        .then(response => response.json())
        .then(data => {
            if (data.result === 'correct') {
                displayCelebration();
            } else {
                incrementAttempts();
            }
        });
}

// particlesjs not on DefinitelyTyped
declare var particlesJS: any;
function displayCelebration() {
    // Displaying confetti
    particlesJS('map-id', {
        "particles": {
            "number": {
                "value": 400,
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "color": {
                "value": "#ff0000"
            },
            "opacity": {
                "value": 0.7
            },
            "size": {
                "value": 10
            },
            "line_linked": {
                "enable": false
            },
            "move": {
                "direction": "top",
                "speed": 1.5
            }
        },
        "interactivity": {
            "events": {
                "onclick": {
                    "enable": true,
                    "mode": "remove"
                }
            },
            "modes": {
                "remove": {
                    "particles_nb": 10
                }
            }
        }
    });

    // Maybe display a modal or an alert saying "Hurray! You're right!"
    alert("Hurray! You're right!");
}

function incrementAttempts() {
    const counter = document.getElementById('attempt-counter') as HTMLElement;
    let currentAttempts = parseInt(counter.innerText, 10);
    counter.innerText = (currentAttempts + 1).toString();

    alert('Try again!')
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
