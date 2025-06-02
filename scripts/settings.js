// Depends on: constants.js (for GAME_STATE),
// Depends on: ui.js (for updateUI, switchMenu, showGameOverScreen),
// Depends on: gameLogic.js (for startGameLoop)
// Depends on: visualFX.js (for scene, asteroids, lasers, explosions)
// Depends on: upgradeMenu.js (for renderUpgradesMenu, renderSolarHarvestingMenu)
// Depends on: problems/problemGenerator.js (for generateProblem)

/**
 * Saves the current game state to localStorage in a specified slot.
 * @param {number} slot - The save slot number (1, 2, or 3).
 */
function saveGame(slot) {
    try {
        localStorage.setItem(`mathAsteroidsSave${slot}`, JSON.stringify(GAME_STATE));
        alert(`Game saved to slot ${slot}!`);
    } catch (e) {
        console.error("Failed to save game:", e);
        alert("Error: Could not save game. Local storage might be full or blocked.");
    }
}

/**
 * Loads game state from localStorage from a specified slot.
 * @param {number} slot - The save slot number (1, 2, or 3).
 */
function loadGame(slot) {
    try {
        const savedState = localStorage.getItem(`mathAsteroidsSave${slot}`);
        if (savedState) {
            const loadedState = JSON.parse(savedState);
            // Merge loaded state into current state, providing defaults for new properties
            GAME_STATE = { 
                rankIndex: 0, credits: 0, shields: 5, maxShields: 100, 
                totalDamageDealt: 0, upgrades: {}, 
                solarHarvesting: { active: false, fuel: 100, lastHarvestTime: Date.now() }, 
                currentProblem: null, currentInput: '', isGamePaused: false, isGameOver: false,
                weaponsJammedUntil: 0, 
                ...loadedState 
            };

            // Ensure solar harvesting lastHarvestTime is updated on load for correct idle calculation
            GAME_STATE.solarHarvesting.lastHarvestTime = Date.now();

            // Re-apply max shields based on loaded upgrades, if any
            GAME_STATE.maxShields = 100; // Reset base max shields before applying upgrades
            for (const upgradeId in GAME_STATE.upgrades) {
                if (GAME_STATE.upgrades[upgradeId] && UPGRADES_DATA[upgradeId] && UPGRADES_DATA[upgradeId].effect.maxShieldsIncrease) {
                    GAME_STATE.maxShields += UPGRADES_DATA[upgradeId].effect.maxShieldsIncrease;
                }
            }
            // Clamp shields to max shields
            GAME_STATE.shields = Math.min(GAME_STATE.shields, GAME_STATE.maxShields);


            alert(`Game loaded from slot ${slot}!`);
            if (GAME_STATE.isGameOver) {
                showGameOverScreen();
            } else {
                switchMenu('game'); 
                generateProblem(); 
                updateUI();
            }
        } else {
            console.log(`No save found in slot ${slot}. Starting new game.`);
            resetGame(); 
        }
    } catch (e) {
        console.error("Failed to load game:", e);
        alert("Error: Could not load game. Save data might be corrupted.");
        resetGame(); 
    }
}

/**
 * Resets the current game state to initial values.
 */
function resetGame() {
    GAME_STATE = {
        rankIndex: 0,
        credits: 0,
        shields: 5, 
        maxShields: 100, 
        totalDamageDealt: 0,
        upgrades: {},
        solarHarvesting: {
            active: false,
            fuel: 100,
            lastHarvestTime: Date.now()
        },
        currentProblem: null,
        currentInput: '',
        isGamePaused: false,
        isGameOver: false,
        weaponsJammedUntil: 0, 
    };
    // Clear Three.js objects from scene
    asteroids.forEach(a => scene.remove(a));
    asteroids.length = 0;
    lasers.forEach(l => scene.remove(l));
    lasers.length = 0;
    explosions.forEach(e => scene.remove(e));
    explosions.length = 0;

    gameOverScreen.classList.add('hidden');
    switchMenu('game'); 
    generateProblem();
    updateUI();
    renderUpgradesMenu(); 
    renderSolarHarvestingMenu();
    startGameLoop(); // Restart the animation loop
    saveGame(1); // Save the reset game state to slot 1
}
