// Set up basic map properties
var NorwayMap = /** @class */ (function () {
    function NorwayMap() {
        this.initializeMap();
    }
    NorwayMap.prototype.initializeMap = function () {
        var _this = this;
        var osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });
        this.map = L.map('map-id', { layers: [osmLayer] }).setView([63.8305, 8.4689], 5);
        this.map.whenReady(function () {
            _this.map.invalidateSize();
        });
    };
    NorwayMap.prototype.addGeoJSONLayer = function (data) {
        L.geoJSON(data, {
            style: {
                color: '#000',
                weight: 2,
                fillOpacity: 0.2
            },
            onEachFeature: function (feature, layer) {
                if (feature.properties && feature.properties.navn) {
                    layer.on('click', function (e) {
                        var municipalityNameElem = document.getElementById('municipality-name');
                        municipalityNameElem.innerText = "Du trykket p\u00E5 ".concat(feature.properties.navn);
                        // Prevent event propagation
                        e.originalEvent.stopPropagation();
                    });
                }
            }
        }).addTo(this.map);
    };
    NorwayMap.prototype.highlightMunicipality = function (name) {
        logToPage("Highlighted: " + name);
        this.map.eachLayer(function (layer) {
            if (layer instanceof L.GeoJSON) {
                layer.eachLayer(function (featureLayer) {
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
    };
    NorwayMap.prototype.resetHighlights = function () {
        this.map.eachLayer(function (layer) {
            if (layer instanceof L.GeoJSON) {
                layer.eachLayer(function (featureLayer) {
                    if (typeof featureLayer.setStyle === 'function') {
                        featureLayer.setStyle({
                            fillColor: '#000',
                            fillOpacity: 0.2
                        });
                    }
                });
            }
        });
    };
    return NorwayMap;
}());
function logToPage(message) {
    var logElement = document.getElementById('debug-log');
    if (logElement) {
        logElement.innerHTML += "<div>".concat(message, "</div>");
    }
}
var searchInput = document.getElementById('municipality-search');
var autocompleteResults = document.getElementById('autocomplete-results');
var activeItemIndex = -1;
searchInput.addEventListener('keydown', function (e) {
    var items = Array.from(autocompleteResults.children);
    if (e.key === "ArrowDown") {
        if (activeItemIndex < items.length - 1) {
            activeItemIndex++;
        }
    }
    else if (e.key === "ArrowUp") {
        if (activeItemIndex > 0) {
            activeItemIndex--;
        }
    }
    else if (e.key === "Enter") {
        if (activeItemIndex > -1 && activeItemIndex < items.length) {
            searchInput.value = items[activeItemIndex].innerHTML;
            autocompleteResults.innerHTML = '';
            e.preventDefault(); // Prevent form submission or other default behaviors
        }
    }
    // Highlight the active item
    items.forEach(function (item, index) {
        if (index === activeItemIndex) {
            item.classList.add('active');
        }
        else {
            item.classList.remove('active');
        }
    });
});
searchInput.addEventListener('input', function () {
    var query = this.value;
    activeItemIndex = -1;
    if (!query) {
        autocompleteResults.innerHTML = '';
        return;
    }
    // Fetch possible matches from the backend
    fetch("/search-municipalities?q=".concat(query))
        .then(function (response) { return response.json(); })
        .then(function (data) {
        autocompleteResults.innerHTML = '';
        data.names.forEach(function (name) {
            var item = document.createElement('div');
            item.innerHTML = name;
            item.addEventListener('click', function () {
                searchInput.value = this.innerHTML;
                autocompleteResults.innerHTML = '';
            });
            autocompleteResults.appendChild(item);
        });
    });
});
// Close the dropdown if the user clicks outside of it
document.addEventListener('click', function (event) {
    if (event.target !== searchInput) {
        autocompleteResults.innerHTML = '';
    }
});
var submitButton = document.getElementById('submit-guess');
submitButton === null || submitButton === void 0 ? void 0 : submitButton.addEventListener('click', function () {
    var guess = document.getElementById('municipality-search').value;
    checkGuess(guess);
});
function checkGuess(guess) {
    fetch('/check-guess', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ guess: guess })
    })
        .then(function (response) { return response.json(); })
        .then(function (data) {
        if (data.result === 'correct') {
            displayCelebration();
        }
        else {
            incrementAttempts();
        }
    });
}
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
    var counter = document.getElementById('attempt-counter');
    var currentAttempts = parseInt(counter.innerText, 10);
    counter.innerText = (currentAttempts + 1).toString();
    alert('Try again!');
}
document.addEventListener('DOMContentLoaded', function () {
    var norwayMap = new NorwayMap();
    fetch('/geojson')
        .then(function (response) { return response.json(); })
        .then(function (data) { return norwayMap.addGeoJSONLayer(data); });
    var startGameButton = document.getElementById('start-game-btn');
    startGameButton === null || startGameButton === void 0 ? void 0 : startGameButton.addEventListener('click', function () {
        logToPage("Start Game button clicked!");
        norwayMap.resetHighlights();
        fetch('/get-random-municipality')
            .then(function (response) { return response.json(); })
            .then(function (data) {
            norwayMap.highlightMunicipality(data.name);
            var iconElem = document.getElementById('municipality-icon');
            iconElem.src = data.icon_url;
            iconElem.style.display = 'block';
        });
    });
});
