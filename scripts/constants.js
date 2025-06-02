// This file defines the core mutable game state.
// Other scripts will directly modify or read from this global object.
let GAME_STATE = {
    rankIndex: 0, // Index into RANKS array (from gameData.js)
    credits: 0,
    shields: 5, // Now a percentage
    maxShields: 100, // Max possible percentage
    totalDamageDealt: 0,
    upgrades: {}, // Stores { upgradeId: true/false }
    solarHarvesting: {
        active: false,
        fuel: 100, // %
        lastHarvestTime: Date.now() // For idle calculation
    },
    currentProblem: null, // { problem: '3 + 5 = ?', answer: 8, damage: 10 }
    currentInput: '',
    isGamePaused: false, // For menus
    isGameOver: false,
    weaponsJammedUntil: 0, // Timestamp when weapons jam ends
};

// Global references for Three.js objects (initially null)
let scene = null;
let camera = null;
let renderer = null;
let playerShip = null;

// Arrays for active Three.js objects
const asteroids = [];
const lasers = [];
const explosions = [];

// Game loop related variables
let asteroidSpawnTimer = 0;
let lastFrameTime = performance.now();
let regenTimer = 0; // For shield regeneration

// Audio context (initialized in utilities)
let audioContext = null;
