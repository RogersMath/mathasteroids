// This file orchestrates the initialization and main game loop.
// It imports/depends on functions from all other script files.

// Ensure Three.js is loaded before running our script
window.onload = function() {
    if (typeof THREE === 'undefined') {
        console.error('Three.js failed to load. Please check your network connection.');
        return;
    }
    initializeGame();
};

/**
 * Initializes the entire game: sets up Three.js, event listeners, loads game state,
 * and starts the main game loop.
 */
function initializeGame() {
    setupThreeJs(); // From visualFX.js
    setupEventListeners(); // From ui.js
    initAudioContext(); // From utilities.js
    
    loadGame(1); // From settings.js - Try to load from slot 1 on startup

    if (GAME_STATE.isGameOver) {
        showGameOverScreen(); // From ui.js
    } else {
        switchMenu('game'); // From ui.js - Ensure correct menu is active on load
        updateUI(); // From ui.js
        generateProblem(); // From problems/problemGenerator.js
        startGameLoop(); // From gameLogic.js
    }

    renderUpgradesMenu(); // From upgradeMenu.js - Render once at start to populate
    renderSolarHarvestingMenu(); // From upgradeMenu.js
}
