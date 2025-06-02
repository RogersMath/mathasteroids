// Depends on: constants.js (for scene, audioContext)

/**
 * Removes a Three.js object from the scene and its tracking array.
 * @param {THREE.Object3D} obj - The Three.js object to remove.
 * @param {Array<THREE.Object3D>} array - The array from which to remove the object.
 */
function removeObject(obj, array) {
    scene.remove(obj);
    const index = array.indexOf(obj);
    if (index > -1) {
        array.splice(index, 1);
    }
}

/**
 * Initializes the Web Audio API context.
 */
function initAudioContext() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.warn('Web Audio API not supported in this browser:', e);
        audioContext = null;
    }
}

/**
 * Plays a simple sound effect using Web Audio API.
 * This is a basic placeholder; SFX.js would handle more complex/loaded sounds.
 * @param {string} type - The type of sound to play ('shoot', 'destroy', 'hit', 'correct', 'incorrect', 'rank_up').
 */
function playSound(type) {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    let freq = 440; 
    let duration = 0.1; 
    let volume = 0.1; 

    switch (type) {
        case 'shoot':
            freq = 880;
            duration = 0.05;
            volume = 0.05;
            break;
        case 'destroy':
            freq = 220;
            duration = 0.2;
            volume = 0.15;
            oscillator.type = 'sawtooth';
            break;
        case 'hit':
            freq = 110;
            duration = 0.1;
            volume = 0.2;
            oscillator.type = 'square';
            break;
        case 'correct':
            freq = 1000;
            duration = 0.07;
            volume = 0.08;
            break;
        case 'incorrect':
            freq = 150;
            duration = 0.12;
            volume = 0.12;
            oscillator.type = 'triangle';
            break;
        case 'rank_up':
            freq = 1200;
            duration = 0.4;
            volume = 0.15;
            oscillator.type = 'sine';
            const now = audioContext.currentTime;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

            oscillator.frequency.setValueAtTime(freq, now);
            oscillator.frequency.linearRampToValueAtTime(freq * 1.5, now + duration * 0.5);
            oscillator.frequency.linearRampToValueAtTime(freq * 2, now + duration);
            break;
    }

    if (type !== 'rank_up') {
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    }

    oscillator.frequency.value = freq;
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
}
