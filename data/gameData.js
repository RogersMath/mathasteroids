// This file holds game-specific data for easy re-skinning/theming.

// Ranks for the current theme (Math Asteroids)
const RANKS = [
    { name: 'Scavenger', baseDifficultyMultiplier: 1.0, unlockThreshold: 0 },
    { name: 'Hauler', baseDifficultyMultiplier: 1.2, unlockThreshold: 500 }, // Credits needed to reach
    { name: 'Harvester', baseDifficultyMultiplier: 1.5, unlockThreshold: 1500 },
    { name: 'Merchant', baseDifficultyMultiplier: 2.0, unlockThreshold: 3000 },
    { name: 'Captain', baseDifficultyMultiplier: 2.5, unlockThreshold: 5000 },
    { name: 'Admiral', baseDifficultyMultiplier: 3.0, unlockThreshold: 8000 },
    { name: 'Magnate', baseDifficultyMultiplier: 3.5, unlockThreshold: 12000 }
];

// Upgrade definitions for the current theme
const UPGRADES_DATA = {
    // Weapon Upgrades
    'laser_strength_1': { name: 'Laser Core Mk. I', cost: 100, description: 'Increase laser damage by 10%.', effect: { laserDamageMultiplier: 1.1 }, unlocks: null, rankUnlock: 0 },
    'laser_strength_2': { name: 'Laser Core Mk. II', cost: 300, description: 'Increase laser damage by 15%. Requires Mk. I.', effect: { laserDamageMultiplier: 1.15 }, unlocks: ['laser_strength_1'], rankUnlock: 1 },
    'aoe_laser_1': { name: 'AoE Focus Mk. I', cost: 500, description: 'Lasers now deal 20% AoE damage to nearby asteroids.', effect: { aoeDamageMultiplier: 0.2 }, unlocks: null, rankUnlock: 2 },
    
    // Shield Upgrades
    'shield_hp_1': { name: 'Reinforced Hull Mk. I', cost: 150, description: 'Increase maximum shields by 10% and fully restore shields.', effect: { maxShieldsIncrease: 10, restoreShields: true }, unlocks: null, rankUnlock: 0 },
    'shield_regen_1': { name: 'Emergency Repair Drones', cost: 400, description: 'Regenerates 1% shield every 5 seconds when idle in base.', effect: { shieldRegenRate: 1/5 }, unlocks: null, rankUnlock: 3 }, 
    
    // Economic Upgrades
    'credit_boost_1': { name: 'Credit Converter Mk. I', cost: 75, description: 'Increase credits earned per problem by 10%.', effect: { creditMultiplier: 1.1 }, unlocks: null, rankUnlock: 0 },
    'credit_boost_2': { name: 'Credit Converter Mk. II', cost: 250, description: 'Increase credits earned per problem by 15%. Requires Mk. I.', effect: { creditMultiplier: 1.15 }, unlocks: ['credit_boost_1'], rankUnlock: 1 },

    // Solar Harvesting Upgrades
    'harvest_fuel_1': { name: 'Extended Fuel Tanks', cost: 200, description: 'Increase Solar Harvesting fuel capacity by 25%.', effect: { fuelCapacity: 1.25 }, unlocks: null, rankUnlock: 1 },
    'harvest_efficiency_1': { name: 'Solar Array Optimizers', cost: 300, description: 'Increase Solar Harvesting credit gain by 15%.', effect: { solarCreditMultiplier: 1.15 }, unlocks: null, rankUnlock: 2 },

    // Problem Type Unlocks
    'problem_type_subtraction': { name: 'Subtraction Protocols', cost: 150, description: 'Unlocks subtraction problems (a-c).', effect: { problemTypes: ['subtraction'] }, unlocks: null, rankUnlock: 0 },
    // Add more problem type unlocks here
};

// Simplified Solar Harvesting Constants
const SOLAR_HARVESTING_BASE_CREDITS_PER_SEC = 1.0; 
const SOLAR_HARVESTING_BASE_FUEL_CONSUMPTION_PER_SEC = 0.05; 
const ASTEROID_DIFFICULTY_FROM_HARVESTING = 10; 
