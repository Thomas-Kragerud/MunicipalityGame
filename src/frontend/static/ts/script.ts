import axios from 'axios';

// Find the HTML elements we'll need
const startButton = document.getElementById('startButton');
const guessButton = document.getElementById('guessButton');
const targetMunicipalityElement = document.getElementById('targetMunicipality');
const resultElement = document.getElementById('result');
const guessInputElement = document.getElementById('guess') as HTMLInputElement;

// Add event listener for the start button
if (startButton) {
    startButton.addEventListener('click', async () => {
        const response = await axios.get('/start');
        if (targetMunicipalityElement) {
            targetMunicipalityElement.textContent = `Find: ${response.data.target_municipality}`;
        }
        if (resultElement) {
            resultElement.textContent = '';
        }
    });
}

// Add event listener for the guess button
if (guessButton && guessInputElement && resultElement) {
    guessButton.addEventListener('click', async () => {
        const guess = guessInputElement.value;
        const response = await axios.get(`/guess/${guess}`);
        resultElement.textContent = response.data.correct ? 'Correct!' : 'Try again';
    });
}
