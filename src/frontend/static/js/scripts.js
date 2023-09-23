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
