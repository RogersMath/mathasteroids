// Depends on: constants.js (for GAME_STATE, RANKS, UPGRADES_DATA, SOLAR_HARVESTING_BASE_*, 
// ASTEROID_DIFFICULTY_FROM_HARVESTING, asteroidSpawnTimer, lastFrameTime, regenTimer, 
// asteroids, lasers, explosions, playerShip, scene, renderer, camera,
// audioContext),
// Depends on: problems/problemGenerator.js (for generateProblem)
// Depends on: visualFX.js (for spawnAsteroid, updateAsteroids, updateLasers, updateExplosions, fireLaser, onLaserImpact)
// Depends on: ui.js (for updateUI, showGameOverScreen)
// Depends on: utilities.js (for takeDamage, playSound, removeObject)

/**
 * Starts the main game animation loop.
 */
function startGameLoop() {
    requestAnimationFrame(animate);
}

/**
 * The main animation and game logic loop.
 * @param {DOMHighResTimeStamp} currentTime - The current time provided by requestAnimationFrame.
 */
function animate(currentTime) {
    if (GAME_STATE.isGameOver) return; 

    const deltaTime = (currentTime - lastFrameTime) / 1000; // in seconds
    lastFrameTime = currentTime;

    if (!GAME_STATE.isGamePaused) {
        // Asteroid Spawning
        asteroidSpawnTimer += deltaTime;
        let difficultyFromHarvesting = GAME_STATE.solarHarvesting.active ? ASTEROID_DIFFICULTY_FROM_HARVESTING : 0;
        const spawnInterval = 3 - (GAME_STATE.rankIndex * 0.2) - (difficultyFromHarvesting / 10);
        if (asteroidSpawnTimer >= spawnInterval) {
            spawnAsteroid();
            asteroidSpawnTimer = 0;
        }

        // Update Three.js objects
        updateAsteroids(deltaTime);
        updateLasers(deltaTime);
        updateExplosions(deltaTime);

        // Solar Harvesting
        updateSolarHarvesting(deltaTime);

        // Shield Regeneration (only if in "base" - i.e., not actively harvesting and has the upgrade)
        if (!GAME_STATE.solarHarvesting.active && GAME_STATE.upgrades['shield_regen_1']) {
            regenTimer += deltaTime;
            const regenRate = UPGRADES_DATA['shield_regen_1'].effect.shieldRegenRate;
            if (regenTimer >= 1 / regenRate) {
                GAME_STATE.shields = Math.min(GAME_STATE.maxShields, GAME_STATE.shields + 1); 
                regenTimer = 0; 
            }
        }
    }

    updateUI(); 
    renderer.render(scene, camera); // Render the Three.js scene
    requestAnimationFrame(animate);
}

/**
 * Handles the submission of a problem answer.
 */
function handleSubmitAnswer() {
    if (GAME_STATE.isGamePaused || GAME_STATE.isGameOver || Date.now() < GAME_STATE.weaponsJammedUntil || !GAME_STATE.currentProblem) return;

    let submittedAnswer = GAME_STATE.currentInput;
    let correctAnswer = GAME_STATE.currentProblem.answer;
    let isCorrect = false;

    if (!isNaN(parseFloat(submittedAnswer))) {
        if (parseFloat(submittedAnswer) === correctAnswer) {
            isCorrect = true;
        }
    }
    // For now, if "pi" or "^" are in the input, consider it potentially incorrect for simple problems
    if (submittedAnswer.includes('π') || submittedAnswer.includes('^')) {
        isCorrect = false; 
    }

    if (isCorrect) {
        playSound('correct');
        let problemDamage = GAME_STATE.currentProblem.damage;
        if (GAME_STATE.upgrades['laser_strength_1']) problemDamage *= UPGRADES_DATA['laser_strength_1'].effect.laserDamageMultiplier;
        if (GAME_STATE.upgrades['laser_strength_2']) problemDamage *= UPGRADES_DATA['laser_strength_2'].effect.laserDamageMultiplier;
        fireLaser(problemDamage);

        let creditsGained = 5 + GAME_STATE.rankIndex * 2;
        if (GAME_STATE.upgrades['credit_boost_1']) creditsGained *= UPGRADES_DATA['credit_boost_1'].effect.creditMultiplier;
        if (GAME_STATE.upgrades['credit_boost_2']) creditsGained *= UPGRADES_DATA['credit_boost_2'].effect.creditMultiplier;
        GAME_STATE.credits += Math.round(creditsGained);
    } else {
        playSound('incorrect');
        GAME_STATE.weaponsJammedUntil = Date.now() + 3000; // 3-second jam
    }

    generateProblem(); 
    updateUI();
}

/**
 * Checks if the player has accumulated enough credits to reach a new rank.
 */
function checkRankUp() {
    const currentRank = RANKS[GAME_STATE.rankIndex];
    if (GAME_STATE.rankIndex < RANKS.length - 1) {
        const nextRank = RANKS[GAME_STATE.rankIndex + 1];
        if (GAME_STATE.credits >= nextRank.unlockThreshold) {
            GAME_STATE.rankIndex++;
            playSound('rank_up');
            alert(`RANK UP! You are now a ${RANKS[GAME_STATE.rankIndex].name}!`);
            updateUI();
        }
    }
}

/**
 * Handles the logic for Solar Harvesting income and fuel consumption.
 * @param {number} deltaTime - Time elapsed since last frame in seconds.
 */
function updateSolarHarvesting(deltaTime) {
    if (!GAME_STATE.solarHarvesting.active) return;

    let fuelCapacityMultiplier = 1;
    if (GAME_STATE.upgrades['harvest_fuel_1']) fuelCapacityMultiplier *= UPGRADES_DATA['harvest_fuel_1'].effect.fuelCapacity;

    let creditMultiplier = 1;
    if (GAME_STATE.upgrades['harvest_efficiency_1']) creditMultiplier *= UPGRADES_DATA['harvest_efficiency_1'].effect.solarCreditMultiplier;

    const fuelConsumed = SOLAR_HARVESTING_BASE_FUEL_CONSUMPTION_PER_SEC * deltaTime / fuelCapacityMultiplier;
    GAME_STATE.solarHarvesting.fuel -= fuelConsumed;

    if (GAME_STATE.solarHarvesting.fuel <= 0) {
        GAME_STATE.solarHarvesting.fuel = 0;
        GAME_STATE.solarHarvesting.active = false; // Automatically deactivate when fuel runs out
        alert("Fuel exhausted! Solar Harvesting deactivated.");
        updateUI(); 
        return;
    }

    const creditsEarned = SOLAR_HARVESTING_BASE_CREDITS_PER_SEC * deltaTime * creditMultiplier;
    GAME_STATE.credits += creditsEarned;
}

/**
 * Reduces player's shields by a given amount.
 * @param {number} amount - The percentage of shields to reduce.
 */
function takeDamage(amount) { 
    if (GAME_STATE.isGameOver) return;
    GAME_STATE.shields -= amount;
    GAME_STATE.shields = Math.max(0, GAME_STATE.shields); // Shields can't go below 0

    playSound('hit');
    if (GAME_STATE.shields <= 0) {
        GAME_STATE.isGameOver = true;
        showGameOverScreen();
    }
}
