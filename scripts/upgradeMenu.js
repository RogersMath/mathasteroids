// Depends on: constants.js (for GAME_STATE, RANKS, UPGRADES_DATA, SOLAR_HARVESTING_BASE_CREDITS_PER_SEC),
// Depends on: ui.js (for updateUI), 
// Depends on: gameLogic.js (for checkRankUp)
// Depends on: settings.js (for saveGame)

// UI elements for the upgrades menu
const upgradeListDiv = document.getElementById('upgrade-list');


/**
 * Renders or re-renders the list of upgrades in the upgrades menu.
 * This should be called whenever game state affecting upgrades changes (e.g., credits, rank).
 */
function renderUpgradesMenu() {
    upgradeListDiv.innerHTML = ''; // Clear previous list
    for (const upgradeId in UPGRADES_DATA) {
        const upgrade = UPGRADES_DATA[upgradeId];
        const isPurchased = GAME_STATE.upgrades[upgradeId];
        const canAfford = GAME_STATE.credits >= upgrade.cost;
        const meetsRank = GAME_STATE.rankIndex >= upgrade.rankUnlock;
        
        let meetsUnlocks = true;
        if (upgrade.unlocks) {
            for (const requiredUnlock of upgrade.unlocks) {
                if (!GAME_STATE.upgrades[requiredUnlock]) {
                    meetsUnlocks = false;
                    break;
                }
            }
        }

        const isDisabled = isPurchased || !canAfford || !meetsRank || !meetsUnlocks;
        const buttonText = isPurchased ? 'PURCHASED' : `BUY (${upgrade.cost} Cr)`;

        const upgradeItem = document.createElement('div');
        upgradeItem.classList.add('upgrade-item');
        upgradeItem.innerHTML = `
            <div class="info">
                <strong>${upgrade.name}</strong><br>
                <span>${upgrade.description}</span><br>
                ${!meetsUnlocks ? '<span style="color:red; font-size: 0.8em;">(Requires ' + upgrade.unlocks.map(id => UPGRADES_DATA[id].name).join(', ') + ')</span>' : ''}
                ${!meetsRank ? '<span style="color:orange; font-size: 0.8em;">(Requires Rank ' + RANKS[upgrade.rankUnlock].name + ')</span>' : ''}
            </div>
            <button id="buy-${upgradeId}" ${isDisabled ? 'disabled' : ''}>${buttonText}</button>
        `;
        upgradeListDiv.appendChild(upgradeItem);

        if (!isDisabled) {
            upgradeItem.querySelector('button').onclick = () => buyUpgrade(upgradeId);
        }
    }
}

/**
 * Attempts to buy an upgrade.
 * @param {string} upgradeId - The ID of the upgrade to purchase.
 */
function buyUpgrade(upgradeId) {
    const upgrade = UPGRADES_DATA[upgradeId];
    if (!upgrade || GAME_STATE.upgrades[upgradeId] || GAME_STATE.credits < upgrade.cost) {
        console.warn('Cannot buy upgrade:', upgradeId);
        return;
    }

    GAME_STATE.credits -= upgrade.cost;
    GAME_STATE.upgrades[upgradeId] = true;

    // Apply immediate effects
    if (upgrade.effect.maxShieldsIncrease) {
        GAME_STATE.maxShields += upgrade.effect.maxShieldsIncrease;
    }
    if (upgrade.effect.restoreShields) {
        GAME_STATE.shields = GAME_STATE.maxShields; // Fully restore shields
    }

    checkRankUp(); 
    updateUI();
    saveGame(1); // Auto-save after buying upgrade
}

// UI elements for Solar Harvesting
const solarHarvestingStatus = document.getElementById('solar-harvesting-status');

/**
 * Renders the state of the Solar Harvesting section.
 */
function renderSolarHarvestingMenu() {
    solarHarvestingStatus.textContent = `Status: ${GAME_STATE.solarHarvesting.active ? 'Active' : 'Idle'} | Fuel: ${GAME_STATE.solarHarvesting.fuel.toFixed(0)}%`;
    
    if (GAME_STATE.solarHarvesting.active) {
        solarHarvestingToggle.textContent = "Deactivate Harvesting";
        solarHarvestingToggle.classList.add('active');
    } else {
        solarHarvestingToggle.textContent = "Activate Harvesting";
        solarHarvestingToggle.classList.remove('active');
    }
    // Disable if fuel is 0 and not active
    if (GAME_STATE.solarHarvesting.fuel <= 0 && !GAME_STATE.solarHarvesting.active) {
        solarHarvestingToggle.disabled = true;
        solarHarvestingToggle.textContent = "Out of Fuel";
    } else {
         solarHarvestingToggle.disabled = false;
    }
}

/**
 * Toggles the active state of Solar Harvesting.
 */
function toggleSolarHarvesting() {
    if (GAME_STATE.solarHarvesting.fuel <= 0 && !GAME_STATE.solarHarvesting.active) {
        alert("Cannot activate: Fuel is exhausted!");
        return;
    }

    GAME_STATE.solarHarvesting.active = !GAME_STATE.solarHarvesting.active;
    GAME_STATE.solarHarvesting.lastHarvestTime = Date.now(); // Reset timer
    updateUI();
    saveGame(1);
}
