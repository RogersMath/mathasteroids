// Depends on: constants.js (for RANKS and difficulty multipliers)

/**
 * Generates a math problem based on current game state.
 * @returns {object} An object containing the problem string, its answer, and base damage.
 */
function generateProblem() {
    let num1, num2, problem, answer;
    let currentRank = RANKS[GAME_STATE.rankIndex]; // RANKS is a global from gameData.js

    // MVP: a + b
    num1 = Math.floor(Math.random() * 20 * currentRank.baseDifficultyMultiplier) + 1;
    num2 = Math.floor(Math.random() * 20 * currentRank.baseDifficultyMultiplier) + 1;
    problem = `${num1} + ${num2} = ?`;
    answer = num1 + num2;

    // Problem Type Unlocks (from GAME_STATE.upgrades, global from constants.js)
    if (GAME_STATE.upgrades['problem_type_subtraction'] && Math.random() < 0.5) { // 50% chance for subtraction if unlocked
       num1 = Math.floor(Math.random() * (30 * currentRank.baseDifficultyMultiplier)) + 10;
       num2 = Math.floor(Math.random() * (num1 - 5)) + 1; // Ensure positive result
       problem = `${num1} - ${num2} = ?`;
       answer = num1 - num2;
    }

    return { problem: problem, answer: answer, damage: 10 + GAME_STATE.rankIndex * 5 }; // Base damage
}
