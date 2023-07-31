"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
(_a = document.getElementById('startButton')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', async () => {
    var _a, _b, _c;
    const response = await axios_1.default.post('/start_game');
    (_a = document.getElementById('targetMunicipality')) === null || _a === void 0 ? void 0 : _a.textContent = `Find: ${response.data.target_municipality}`;
    (_b = document.getElementById('result')) === null || _b === void 0 ? void 0 : _b.textContent = '';
    (_c = document.getElementById('guessButton')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', async () => {
        var _a, _b;
        const guess = (_a = document.getElementById('guess')) === null || _a === void 0 ? void 0 : _a.value;
        const response = await axios_1.default.post('/guess', { guess: guess });
        (_b = document.getElementById('result')) === null || _b === void 0 ? void 0 : _b.textContent = response.data.correct ? 'Correct!' : 'Try again';
    });
});
// Assume that this function is called with the name of the clicked municipality
async function guessMunicipality(name) {
    const response = await axios_1.default.get(`/guess/${name}`);
    document.getElementById('result').textContent = response.data.correct ? 'Correct!' : 'Try again';
}
