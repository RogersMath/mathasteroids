// Depends on: constants.js (for GAME_STATE, RANKS, UPGRADES_DATA), 
// Depends on: problems/problemGenerator.js (for generateProblem)
// Depends on: gameLogic.js (for handleSubmitAnswer, takeDamage)
// Depends on: upgradeMenu.js (for renderUpgradesMenu, renderSolarHarvestingMenu)
// Depends on: settings.js (for saveGame, loadGame, resetGame)
// Depends on: utilities.js (for playSound)


// UI Elements - Global DOM references
const problemTextElem = document.getElementById('problem-text');
const keypadButtons = document.querySelectorAll('.keypad-button');
const enterButton = document.getElementById('enter-button');
const navButtons = document.querySelectorAll('.nav-button');
const gameplayContent = document.getElementById('gameplay-content');
const upgradesMenu = document.getElementById('upgrades-menu');
const settingsMenu = document.getElementById('settings-menu');
const gameOverScreen = document.getElementById('game-over-screen');

const rankDisplay = document.getElementById('rank-display');
const creditsDisplay = document.getElementById('credits-display');
const shieldsDisplay = document.getElementById('shields-display'); 
const damageDisplay = document.getElementById('damage-display');
const fieldDisplay = document.getElementById('field-display'); 
const fuelDisplay = document.getElementById('fuel-display');

const solarHarvestingToggle = document.getElementById('solar-harvesting-toggle'); // Referenced for event listener


// Event Handlers for UI
function setupEventListeners() {
    keypadButtons.forEach(button => {
        button.addEventListener('click', () => handleKeypadInput(button.dataset.value));
    });
    enterButton.addEventListener('click', handleSubmitAnswer);

    document.addEventListener('keydown', handleKeyboardInput);

    navButtons.forEach(button => {
        button.addEventListener('click', () => switchMenu(button.id.replace('nav-', '')));
    });

    solarHarvestingToggle.addEventListener('click', toggleSolarHarvesting); 
}

function handleKeypadInput(value) {
    if (GAME_STATE.isGamePaused || GAME_STATE.isGameOver || Date.now() < GAME_STATE.weaponsJammedUntil) return;

    if (value === 'C') {
        GAME_STATE.currentInput = '';
    } else if (value === 'pi') {
        GAME_STATE.currentInput += 'π'; 
    } else if (value === 'y^x') {
         GAME_STATE.currentInput += '^'; 
    } else {
        GAME_STATE.currentInput += value;
    }
}

function handleKeyboardInput(event) {
    if (GAME_STATE.isGamePaused || GAME_STATE.isGameOver || Date.now() < GAME_STATE.weaponsJammedUntil) return;

    const key = event.key;
    if (/[0-9\.\-\/]/.test(key)) {
        handleKeypadInput(key);
    } else if (key === 'Enter') {
        handleSubmitAnswer();
    } else if (key === 'Backspace') {
        GAME_STATE.currentInput = GAME_STATE.currentInput.slice(0, -1);
    }
}


/**
 * Updates all dynamic UI elements based on the current GAME_STATE.
 * This function should be called frequently (e.g., once per animation frame).
 */
function updateUI() {
    rankDisplay.textContent = `RANK: ${RANKS[GAME_STATE.rankIndex].name}`;
    creditsDisplay.textContent = `Credits: ${Math.floor(GAME_STATE.credits).toLocaleString()}`;
    shieldsDisplay.textContent = `Shields: ${GAME_STATE.shields.toFixed(0)}%`;
    damageDisplay.textContent = `Total Damage: ${GAME_STATE.totalDamageDealt.toLocaleString()}`;
    fieldDisplay.textContent = `Field: ${GAME_STATE.solarHarvesting.active ? 'Active' : 'Idle'}`;
    fuelDisplay.textContent = `Fuel: ${GAME_STATE.solarHarvesting.fuel.toFixed(0)}%`;

    // Update problem text or show jam message
    if (Date.now() < GAME_STATE.weaponsJammedUntil) {
        const jamTimeLeft = Math.ceil((GAME_STATE.weaponsJammedUntil - Date.now()) / 1000);
        problemTextElem.innerHTML = `<span class="gradient-text">WEAPONS JAMMED! (${jamTimeLeft}s)</span>`;
    } else {
        problemTextElem.textContent = GAME_STATE.currentProblem ? GAME_STATE.currentProblem.problem.replace('?', GAME_STATE.currentInput) : 'LOADING...';
    }

    renderUpgradesMenu(); // Re-render to update disabled states / purchased info
    renderSolarHarvestingMenu(); // Re-render to update toggle button state
}

/**
 * Manages which main content screen (game, upgrades, settings, game over) is visible.
 * @param {string} menuName - 'game', 'upgrades', 'settings'.
 */
function switchMenu(menuName) {
    gameplayContent.classList.add('hidden');
    upgradesMenu.classList.add('hidden');
    settingsMenu.classList.add('hidden');
    gameOverScreen.classList.add('hidden'); 

    navButtons.forEach(button => button.classList.remove('active'));

    switch (menuName) {
        case 'game':
            gameplayContent.classList.remove('hidden');
            document.getElementById('nav-game').classList.add('active');
            GAME_STATE.isGamePaused = false;
            break;
        case 'upgrades':
            upgradesMenu.classList.remove('hidden');
            document.getElementById('nav-upgrades').classList.add('active');
            GAME_STATE.isGamePaused = true;
            break;
        case 'settings':
            settingsMenu.classList.remove('hidden');
            document.getElementById('nav-settings').classList.add('active');
            GAME_STATE.isGamePaused = true;
            break;
    }
    updateUI(); 
}

/**
 * Shows the game over screen and pauses the game.
 */
function showGameOverScreen() {
    gameOverScreen.classList.remove('hidden');
    GAME_STATE.isGamePaused = true;
    document.getElementById('nav-game').classList.remove('active'); 
}
